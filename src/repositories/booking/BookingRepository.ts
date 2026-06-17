import mongoose, { ClientSession } from "mongoose";
import { Booking } from "../../domain/entities/Booking";
import { BookingModel } from "../../infrastructure/services/mongodb/models/booking/BookingModel";
import { IBookingRepository } from "./IBookingRepository";

interface BookingAggregationDoc {
  _id: mongoose.Types.ObjectId;
  bookingNumber: string;
  auditoriumId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  dayRate: number;
  totalAmount: number;
  bookingStatus: string;
  guestCount: number;
  createdAt: Date;
  updatedAt: Date;
  auditorium?: {
    name: string;
    address: string;
    images: string[];
  };
}

const auditoriumLookup = [
  {
    $lookup: {
      from: "auditoriums",
      localField: "auditoriumId",
      foreignField: "_id",
      pipeline: [{ $project: { name: 1, address: 1, images: 1 } }],
      as: "auditoriumData",
    },
  },
  {
    $addFields: {
      auditorium: { $arrayElemAt: ["$auditoriumData", 0] },
    },
  },
  { $project: { auditoriumData: 0 } },
];

export class BookingRepository implements IBookingRepository {
  private toEntity(doc: BookingAggregationDoc): Booking {
    const booking: Booking = {
      id: doc._id.toString(),
      bookingNumber: doc.bookingNumber,
      auditoriumId: doc.auditoriumId.toString(),
      userId: doc.userId.toString(),
      ownerId: doc.ownerId.toString(),
      startDate: doc.startDate,
      endDate: doc.endDate,
      totalDays: doc.totalDays,
      dayRate: doc.dayRate,
      totalAmount: doc.totalAmount,
      bookingStatus: doc.bookingStatus as Booking["bookingStatus"],
      guestCount: doc.guestCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    if (doc.auditorium && doc.auditorium.name) {
      booking.auditorium = {
        name: doc.auditorium.name,
        address: doc.auditorium.address,
        images: doc.auditorium.images || [],
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
      ...auditoriumLookup,
    ]).session(session ?? null);

    return this.toEntity(results[0]);
  }

  async findById(id: string): Promise<Booking | null> {
    const results = await BookingModel.aggregate<BookingAggregationDoc>([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      ...auditoriumLookup,
    ]);
    if (!results.length) return null;
    return this.toEntity(results[0]);
  }

  async findByBookingNumber(bookingNumber: string): Promise<Booking | null> {
    const results = await BookingModel.aggregate<BookingAggregationDoc>([
      { $match: { bookingNumber } },
      ...auditoriumLookup,
    ]);
    if (!results.length) return null;
    return this.toEntity(results[0]);
  }

  async update(
    id: string,
    data: Partial<Booking>,
    session?: ClientSession,
  ): Promise<Booking | null> {
    await BookingModel.findByIdAndUpdate(id, data, { session });

    const results = await BookingModel.aggregate<BookingAggregationDoc>([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      ...auditoriumLookup,
    ]).session(session ?? null);

    if (!results.length) return null;
    return this.toEntity(results[0]);
  }

  async deleteById(id: string): Promise<void> {
    await BookingModel.findByIdAndDelete(id);
  }

  async listByCustomer(userId: string): Promise<Booking[]> {
    const results = await BookingModel.aggregate<BookingAggregationDoc>([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      ...auditoriumLookup,
      { $sort: { createdAt: -1 } },
    ]);
    return results.map((doc) => this.toEntity(doc));
  }

  async listByOwner(ownerId: string): Promise<Booking[]> {
    const results = await BookingModel.aggregate<BookingAggregationDoc>([
      { $match: { ownerId: new mongoose.Types.ObjectId(ownerId) } },
      ...auditoriumLookup,
      { $sort: { createdAt: -1 } },
    ]);
    return results.map((doc) => this.toEntity(doc));
  }

  async checkAvailability(
    auditoriumId: string,
    startDate: Date,
    endDate: Date,
    excludeBookingId?: string,
  ): Promise<boolean> {
    const overlapping = await BookingModel.findOne({
      auditoriumId,
      bookingStatus: { $in: ["PENDING_PAYMENT", "CONFIRMED", "COMPLETED"] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
      ...(excludeBookingId && {
        _id: { $ne: new mongoose.Types.ObjectId(excludeBookingId) },
      }),
    });
    return !overlapping;
  }
}
