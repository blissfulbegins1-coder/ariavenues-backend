import mongoose, { ClientSession, QueryFilter, PipelineStage } from "mongoose";
import { Booking } from "../../domain/entities/Booking";
import { BookingModel } from "../../infrastructure/services/mongodb/models/booking/BookingModel";
import { IBookingRepository } from "./IBookingRepository";
import { BookingDbQuery, PaginatedBookingsResponse, GetOwnerDashboardStatsDataParams, GetOwnerDashboardStatsDataResponse, OwnerMonthlyRevenue, OwnerActivityItem } from "../../domain/dtos/booking/BookingDto";
import { parseDDMMYYYY } from "../../domain/functions/dateFunctions";
import { BookingStatus } from "../../domain/enums/BookingStatus";
import { logger } from "../../utils/logger";
import { FIXED_BOOKING_AMOUNT } from "../../config/env";

type BookingAggregationDoc = {
  _id: mongoose.Types.ObjectId;
  bookingNumber: string;
  auditoriumId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  totalAmount?: number;
  bookingStatus: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
  auditorium?: {
    name: string;
    address: string;
    images: string[];
  };
  user?: {
    name: string;
    email?: string;
    mobile?: string;
  };
  owner?: {
    name: string;
    email?: string;
    mobile?: string;
  };
}

const bookingDetailsLookup = [
  {
    $lookup: {
      from: "auditoriums",
      localField: "auditoriumId",
      foreignField: "_id",
      pipeline: [
        { $project: { name: 1, address: 1, images: { $slice: ["$images", 1] } } }
      ],
      as: "auditoriumData",
    },
  },
  {
    $addFields: {
      auditorium: { $arrayElemAt: ["$auditoriumData", 0] },
    },
  },
  { $project: { auditoriumData: 0 } },
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      pipeline: [
        { $project: { name: 1, email: 1, mobile: 1 } }
      ],
      as: "userData",
    },
  },
  {
    $addFields: {
      user: { $arrayElemAt: ["$userData", 0] },
    },
  },
  { $project: { userData: 0 } },
  {
    $lookup: {
      from: "users",
      localField: "ownerId",
      foreignField: "_id",
      pipeline: [
        { $project: { name: 1, email: 1, mobile: 1 } }
      ],
      as: "ownerData",
    },
  },
  {
    $addFields: {
      owner: { $arrayElemAt: ["$ownerData", 0] },
    },
  },
  { $project: { ownerData: 0 } },
];

export class BookingRepository implements IBookingRepository {
  private toEntity(doc: BookingAggregationDoc): Booking {
    const totalAmount = doc.totalAmount ?? FIXED_BOOKING_AMOUNT;

    const booking = {
      id: doc._id.toString(),
      bookingNumber: doc.bookingNumber,
      auditoriumId: doc.auditoriumId ? doc.auditoriumId.toString() : "",
      userId: doc.userId ? doc.userId.toString() : "",
      ownerId: doc.ownerId ? doc.ownerId.toString() : "",
      startDate: doc.startDate,
      endDate: doc.endDate,
      startTime: doc.startTime || "09:00 AM",
      endTime: doc.endTime || "06:00 PM",
      totalAmount,
      bookingStatus: doc.bookingStatus as Booking["bookingStatus"],
      isActive: doc.isActive ?? true,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    } as Booking;

    if (doc.auditorium && doc.auditorium.name) {
      booking.auditorium = {
        name: doc.auditorium.name,
        address: doc.auditorium.address,
        images: doc.auditorium.images || [],
      };
    }

    if (doc.user && doc.user.name) {
      booking.user = {
        name: doc.user.name,
        email: doc.user.email,
        mobile: doc.user.mobile,
      };
    }

    if (doc.owner && doc.owner.name) {
      booking.owner = {
        name: doc.owner.name,
        email: doc.owner.email,
        mobile: doc.owner.mobile,
      };
    }

    return booking;
  }

  async create(
    data: Partial<Booking>,
    session?: ClientSession,
  ): Promise<Booking> {
    const booking = new BookingModel(data);
    await booking.save({ session });

    const results = await BookingModel.aggregate<BookingAggregationDoc>([
      { $match: { _id: booking._id } },
      ...bookingDetailsLookup,
    ]).session(session ?? null);

    return this.toEntity(results[0]);
  }

  async findById(id: string, session?: ClientSession): Promise<Booking | null> {
    const results = await BookingModel.aggregate<BookingAggregationDoc>([
      { $match: { _id: new mongoose.Types.ObjectId(id), isActive: true } },
      ...bookingDetailsLookup,
    ]).session(session ?? null);
    if (!results.length) return null;
    return this.toEntity(results[0]);
  }

  async findByBookingNumber(
    bookingNumber: string,
    session?: ClientSession,
  ): Promise<Booking | null> {
    const results = await BookingModel.aggregate<BookingAggregationDoc>([
      { $match: { bookingNumber, isActive: true } },
      ...bookingDetailsLookup,
    ]).session(session ?? null);
    if (!results.length) return null;
    return this.toEntity(results[0]);
  }

  async update(
    id: string,
    data: Partial<Booking>,
    session?: ClientSession,
  ): Promise<Booking | null> {
    await BookingModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), isActive: true },
      data,
      { session },
    );

    const results = await BookingModel.aggregate<BookingAggregationDoc>([
      { $match: { _id: new mongoose.Types.ObjectId(id), isActive: true } },
      ...bookingDetailsLookup,
    ]).session(session ?? null);

    if (!results.length) return null;
    return this.toEntity(results[0]);
  }

  async deleteById(id: string): Promise<void> {
    await BookingModel.findByIdAndUpdate(id, { isActive: false });
  }

  async checkAvailability(
    filter: QueryFilter<Booking>,
  ): Promise<boolean> {
    const overlapping = await BookingModel.findOne({ ...filter, isActive: true });
    return !overlapping;
  }

  async listAll(filter: QueryFilter<Booking>): Promise<Booking[]> {
    const results = await BookingModel.aggregate<BookingAggregationDoc>([
      { $match: { ...filter, isActive: true } },
      ...bookingDetailsLookup,
      { $sort: { createdAt: -1 } },
    ]);
    return results.map((doc) => this.toEntity(doc));
  }

  async getBookings(dbQuery: BookingDbQuery): Promise<PaginatedBookingsResponse> {
    const { query, sort, skip, limit } = dbQuery;

    const pipeline: PipelineStage[] = [
      { $match: { ...query, isActive: true } },
      ...bookingDetailsLookup,
    ];

    if (sort) {
      pipeline.push({ $sort: sort });
    }

    if (skip != null && limit != null) {
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
    }

    const statsQuery: QueryFilter<Booking> = { isActive: true };
    if (query) {
      if (query.ownerId) statsQuery.ownerId = query.ownerId;
      if (query.userId) statsQuery.userId = query.userId;
      if (query.$expr) statsQuery.$expr = query.$expr;
    }

    const [docs, total, totalCount, confirmedCount, completedCount, cancelledCount] = await Promise.all([
      BookingModel.aggregate<BookingAggregationDoc>(pipeline),
      BookingModel.countDocuments({ ...query, isActive: true }).exec(),
      BookingModel.countDocuments(statsQuery).exec(),
      BookingModel.countDocuments({ ...statsQuery, bookingStatus: BookingStatus.CONFIRMED }).exec(),
      BookingModel.countDocuments({ ...statsQuery, bookingStatus: BookingStatus.COMPLETED }).exec(),
      BookingModel.countDocuments({ ...statsQuery, bookingStatus: BookingStatus.CANCELLED }).exec(),
    ]);

    const bookings = docs.map((doc) => this.toEntity(doc));

    return {
      bookings,
      total,
      totalCount,
      confirmedCount,
      completedCount,
      cancelledCount,
    };
  }

  async autoCompletePastBookings(): Promise<void> {
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // 1. Auto-complete past confirmed bookings to completed
      await BookingModel.updateMany(
        {
          bookingStatus: BookingStatus.CONFIRMED,
          $expr: {
            $lt: [
              { $dateFromString: { dateString: "$endDate", format: "%d-%m-%Y" } },
              now,
            ],
          },
        },
        {
          $set: { bookingStatus: BookingStatus.COMPLETED },
        },
      );

      // 2. Automatically cancel and deactivate stale pending_payment bookings older than 15 minutes or past start date
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      await BookingModel.updateMany(
        {
          bookingStatus: BookingStatus.PENDING_PAYMENT,
          $or: [
            { createdAt: { $lt: fifteenMinutesAgo } },
            {
              $expr: {
                $lt: [
                  { $dateFromString: { dateString: "$startDate", format: "%d-%m-%Y" } },
                  now,
                ],
              },
            },
          ],
        },
        {
          $set: { isActive: false, bookingStatus: BookingStatus.CANCELLED },
        },
      );
    } catch (error) {
      logger.error("Error auto-completing past bookings and cleaning stale pending payments:", error);
    }
  }

  async getOwnerDashboardStatsData(
    params: GetOwnerDashboardStatsDataParams,
  ): Promise<GetOwnerDashboardStatsDataResponse> {
    const ownerId = new mongoose.Types.ObjectId(params.ownerId);

    const statsStart = new Date(params.statsStart);
    const statsEnd = new Date(params.statsEnd);

    const baseMatch: QueryFilter<Booking> = {
      ownerId: ownerId as any,
      isActive: true,
      $expr: {
        $and: [
          {
            $gte: [
              { $dateFromString: { dateString: "$startDate", format: "%d-%m-%Y" } },
              statsStart,
            ],
          },
          {
            $lte: [
              { $dateFromString: { dateString: "$startDate", format: "%d-%m-%Y" } },
              statsEnd,
            ],
          },
        ],
      },
    };

    const [totalBookings, confirmedCount, completedCount] = await Promise.all([
      BookingModel.countDocuments(baseMatch),
      BookingModel.countDocuments({ ...baseMatch, bookingStatus: BookingStatus.CONFIRMED }),
      BookingModel.countDocuments({ ...baseMatch, bookingStatus: BookingStatus.COMPLETED }),
    ]);

    const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const startOfYear = new Date(params.targetYear, 0, 1);
    const endOfYear = new Date(params.targetYear, 11, 31, 23, 59, 59, 999);

    const revenueAgg = await BookingModel.aggregate([
      {
        $match: {
          ownerId,
          isActive: true,
          bookingStatus: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CANCELLED] },
        },
      },
      {
        $addFields: {
          parsedStartDate: {
            $dateFromString: {
              dateString: "$startDate",
              format: "%d-%m-%Y",
            },
          },
        },
      },
      {
        $match: {
          parsedStartDate: {
            $gte: startOfYear,
            $lte: endOfYear,
          },
        },
      },
      {
        $group: {
          _id: { $month: "$parsedStartDate" },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const revenueMap: Record<number, number> = {};
    for (const row of revenueAgg) {
      revenueMap[row._id] = row.revenue;
    }

    const monthlyRevenue: OwnerMonthlyRevenue[] = MONTH_SHORT.map((name, i) => ({
      month: name,
      revenue: revenueMap[i + 1] ?? 0,
    }));

    const recentDocs = await BookingModel.aggregate([
      {
        $match: {
          ownerId,
          isActive: true,
          bookingStatus: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "auditoriums",
          localField: "auditoriumId",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1 } }],
          as: "audData",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1 } }],
          as: "userData",
        },
      },
    ]);

    const recentActivity: OwnerActivityItem[] = recentDocs.map((doc: any) => ({
      id: doc._id.toString(),
      type: doc.bookingStatus === BookingStatus.CONFIRMED ? "booking" : "payment",
      bookingNumber: doc.bookingNumber,
      auditoriumName: doc.audData?.[0]?.name,
      customerName: doc.userData?.[0]?.name,
      amount: doc.totalAmount ?? FIXED_BOOKING_AMOUNT,
      createdAt: doc.createdAt,
    }));

    return {
      totalBookings,
      confirmedCount,
      completedCount,
      monthlyRevenue,
      recentActivity,
    };
  }
}
