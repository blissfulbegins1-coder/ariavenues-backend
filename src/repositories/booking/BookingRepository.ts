import mongoose, { ClientSession, QueryFilter } from "mongoose";
import { Booking } from "../../domain/entities/Booking";
import { BookingModel } from "../../infrastructure/services/mongodb/models/booking/BookingModel";
import { IBookingRepository } from "./IBookingRepository";
import { BookingDbQuery, PaginatedBookingsResponse, GetOwnerDashboardStatsDataParams, GetOwnerDashboardStatsDataResponse, OwnerMonthlyRevenue, OwnerActivityItem, CustomerBookingsPaginatedResponse, CustomerBookingsQuery } from "../../domain/dtos/booking/BookingDto";
import { parseDDMMYYYY } from "../../domain/functions/dateFunctions";
import { BookingStatus } from "../../domain/enums/BookingStatus";
import { logger } from "../../utils/logger";


type BookingAggregationDoc = {
  _id: mongoose.Types.ObjectId;
  bookingNumber: string;
  auditoriumId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  startDate: string;
  endDate: string;
  dayRate: number;
  adminAdvance?: number;
  auditoriumAdvance?: number;
  bookingStatus: string;
  guestCount: number;
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
];

export class BookingRepository implements IBookingRepository {
  private toEntity(doc: BookingAggregationDoc): Booking {
    const start = parseDDMMYYYY(doc.startDate);
    const end = parseDDMMYYYY(doc.endDate);
    const totalDays = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
    const adminAdvance = doc.adminAdvance ?? 0;
    const auditoriumAdvance = doc.auditoriumAdvance ?? 0;
    const totalAmount = adminAdvance + auditoriumAdvance;

    const booking = {
      id: doc._id.toString(),
      bookingNumber: doc.bookingNumber,
      auditoriumId: doc.auditoriumId.toString(),
      userId: doc.userId.toString(),
      ownerId: doc.ownerId.toString(),
      startDate: doc.startDate,
      endDate: doc.endDate,
      totalDays,
      dayRate: doc.dayRate,
      totalAmount,
      adminAdvance,
      auditoriumAdvance,
      bookingStatus: doc.bookingStatus as Booking["bookingStatus"],
      guestCount: doc.guestCount,
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

    return booking;
  }

  async create(
    data: Partial<Booking>,
    session?: ClientSession,
  ): Promise<Booking> {
    const booking = new BookingModel(data);
    await booking.save({ session });

    // Use $lookup aggregation after save to retrieve with auditorium details
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

  async listByCustomerPaginated(
    userId: string,
    { page, limit }: CustomerBookingsQuery,
  ): Promise<CustomerBookingsPaginatedResponse> {
    const skip = (page - 1) * limit;
    const matchStage = { userId: new mongoose.Types.ObjectId(userId), isActive: true };

    const [data, countResult] = await Promise.all([
      BookingModel.aggregate<BookingAggregationDoc>([
        { $match: matchStage },
        ...bookingDetailsLookup,
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),
      BookingModel.countDocuments(matchStage as any),
    ]);

    const total = countResult;
    return {
      bookings: data.map((doc) => this.toEntity(doc)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listByOwner(ownerId: string): Promise<Booking[]> {
    const results = await BookingModel.aggregate<BookingAggregationDoc>([
      { $match: { ownerId: new mongoose.Types.ObjectId(ownerId), isActive: true } },
      ...bookingDetailsLookup,
      { $sort: { createdAt: -1 } },
    ]);
    return results.map((doc) => this.toEntity(doc));
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

    const pipeline: any[] = [
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

    const statsQuery: any = { isActive: true };
    if (query && query.$expr) {
      statsQuery.$expr = query.$expr;
    }

    const [docs, total, totalCount, confirmedCount, completedCount, cancelledCount] = await Promise.all([
      BookingModel.aggregate<BookingAggregationDoc>(pipeline),
      BookingModel.countDocuments({ ...query, isActive: true }).exec(),
      BookingModel.countDocuments(statsQuery).exec(),
      BookingModel.countDocuments({ ...statsQuery, bookingStatus: "confirmed" }).exec(),
      BookingModel.countDocuments({ ...statsQuery, bookingStatus: "completed" }).exec(),
      BookingModel.countDocuments({ ...statsQuery, bookingStatus: "cancelled" }).exec(),
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
    } catch (error) {
      logger.error("Error auto-completing past bookings:", error);
    }
  }

  async getOwnerDashboardStatsData(
    params: GetOwnerDashboardStatsDataParams,
  ): Promise<GetOwnerDashboardStatsDataResponse> {
    const ownerId = new mongoose.Types.ObjectId(params.ownerId);

    const statsStart = new Date(params.statsStart);
    const statsEnd = new Date(params.statsEnd);

    const baseMatch: any = {
      ownerId,
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

    const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun",
                          "Jul","Aug","Sep","Oct","Nov","Dec"];

    const startOfYear = new Date(params.targetYear, 0, 1);
    const endOfYear = new Date(params.targetYear, 11, 31, 23, 59, 59, 999);

    const revenueAgg = await BookingModel.aggregate([
      {
        $match: {
          ownerId,
          isActive: true,
          bookingStatus: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
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
          revenue: { $sum: { $add: ["$adminAdvance", "$auditoriumAdvance"] } },
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
      amount: (doc.adminAdvance ?? 0) + (doc.auditoriumAdvance ?? 0),
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
