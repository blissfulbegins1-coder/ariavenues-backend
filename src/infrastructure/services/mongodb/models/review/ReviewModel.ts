import mongoose, { Schema } from "mongoose";
import { Review } from "../../../../../domain/entities/Review";

const reviewSchema = new Schema<Review>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    auditoriumId: {
      type: Schema.Types.ObjectId as any,
      ref: "Auditorium",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const ReviewModel = mongoose.model<Review>(
  "Review",
  reviewSchema,
  "reviews",
);
