import mongoose, { Schema } from "mongoose";
import { Auditorium } from "../../../../../domain/entities/Auditorium";
import { AuditoriumStatus } from "../../../../../domain/enums/AuditoriumStatus";

const auditoriumSchema = new Schema<Auditorium>(
  {
    ownerId: {
      type: Schema.Types.ObjectId as any,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
    },
    dayRate: {
      type: Number,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    averageRating: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalBookings: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: [AuditoriumStatus.PENDING, AuditoriumStatus.DRAFT, AuditoriumStatus.MAINTENANCE, AuditoriumStatus.ACTIVE, AuditoriumStatus.REJECTED, AuditoriumStatus.BLOCKED],
      required: true,
      default: AuditoriumStatus.PENDING,
    },
    approved: {
      type: Boolean,
      required: true,
      default: false,
    },
    adminAdvance: {
      type: Number,
      default: 0,
    },
    auditoriumAdvance: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true },
);

export const AuditoriumModel = mongoose.model<Auditorium>(
  "Auditorium",
  auditoriumSchema,
  "auditoriums",
);
