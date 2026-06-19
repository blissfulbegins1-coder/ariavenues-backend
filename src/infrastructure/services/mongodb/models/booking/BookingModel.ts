import mongoose, { Schema } from "mongoose";
import { Booking } from "../../../../../domain/entities/Booking";
import { BookingStatus } from "../../../../../domain/enums/BookingStatus";

const bookingSchema = new Schema<Booking>(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    auditoriumId: {
      type: Schema.Types.ObjectId as any,
      ref: "Auditorium",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: "User",
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId as any,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    dayRate: {
      type: Number,
      required: true,
    },
    adminAdvance: {
      type: Number,
      required: true,
      default: 0,
    },
    auditoriumAdvance: {
      type: Number,
      required: true,
      default: 0,
    },
    bookingStatus: {
      type: String,
      enum: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      required: true,
      default: BookingStatus.PENDING_PAYMENT,
    },
    guestCount: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true },
);

export const BookingModel = mongoose.model<Booking>(
  "Booking",
  bookingSchema,
  "bookings",
);
