import mongoose, { Schema } from "mongoose";
import { Payment } from "../../../../../domain/entities/Payment";

const paymentSchema = new Schema<Payment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId as any,
      ref: "Booking",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ["INR"],
      required: true,
      default: "INR",
    },
    gateway: {
      type: String,
      enum: ["Razorpay"],
      required: true,
      default: "Razorpay",
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    paymentId: {
      type: String,
      trim: true,
    },
    signature: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["CREATED", "SUCCESS", "FAILED"],
      required: true,
      default: "CREATED",
    },
    paidAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true },
);

export const PaymentModel = mongoose.model<Payment>(
  "Payment",
  paymentSchema,
  "payments",
);
