import mongoose, { ClientSession, QueryFilter } from "mongoose";
import { Booking } from "../../domain/entities/Booking";
import { BookingModel } from "../../infrastructure/services/mongodb/models/booking/BookingModel";
import { IBookingRepository } from "./IBookingRepository";
import { BookingDbQuery, PaginatedBookingsResponse } from "../../domain/dtos/booking/BookingDto";
import { parseDDMMYYYY } from "../../utils/dateUtils";

interface BookingAggregationDoc {
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

  async listByCustomer(userId: string): Promise<Booking[]> {
    const results = await BookingModel.aggregate<BookingAggregationDoc>([
      { $match: { userId: new mongoose.Types.ObjectId(userId), isActive: true } },
      ...bookingDetailsLookup,
      { $sort: { createdAt: -1 } },
    ]);
    return results.map((doc) => this.toEntity(doc));
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
}
