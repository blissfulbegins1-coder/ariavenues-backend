import mongoose, { Schema } from "mongoose";
import { Booking } from "../../../../../domain/entities/Booking";

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
    totalDays: {
      type: Number,
      required: true,
    },
    dayRate: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ["PENDING_PAYMENT", "CONFIRMED", "COMPLETED", "CANCELLED"],
      required: true,
      default: "PENDING_PAYMENT",
    },
    guestCount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export const BookingModel = mongoose.model<Booking>(
  "Booking",
  bookingSchema,
  "bookings",
);
