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
    ownerId: {
      type: Schema.Types.ObjectId as any,
      ref: "User",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: "User",
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      default: "09:00 AM",
    },
    endTime: {
      type: String,
      default: "06:00 PM",
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 2000,
    },
    bookingStatus: {
      type: String,
      enum: [
        BookingStatus.PENDING_PAYMENT,
        BookingStatus.CONFIRMED,
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
      ],
      required: true,
      default: BookingStatus.PENDING_PAYMENT,
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
