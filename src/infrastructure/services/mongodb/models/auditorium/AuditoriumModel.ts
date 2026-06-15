import mongoose, { Schema } from 'mongoose';
import { Auditorium } from '../../../../../domain/entities/Auditorium';

const auditoriumSchema = new Schema<Auditorium>(
  {
    ownerId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
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
      enum: ['draft', 'maintenance', 'active'],
      required: true,
      default: 'draft',
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

export const AuditoriumModel = mongoose.model<Auditorium>('Auditorium', auditoriumSchema);
