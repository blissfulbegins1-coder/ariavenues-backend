import mongoose, { Schema } from "mongoose";
import { Activity } from "../../../../../domain/entities/Activity";

const activitySchema = new Schema<Activity>(
  {
    type: {
      type: String,
      enum: [
        "USER_REGISTERED",
        "OWNER_REGISTERED",
        "AUDITORIUM_SUBMITTED",
        "BOOKING_CONFIRMED",
        "PAYMENT_RECEIVED",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId as any,
      required: true,
    },
    referenceType: {
      type: String,
      enum: ["USER", "OWNER", "AUDITORIUM", "BOOKING", "PAYMENT"],
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId as any,
      required: true,
    },
  },
  { timestamps: true }
);

export const ActivityModel = mongoose.model<Activity>("Activity", activitySchema);
