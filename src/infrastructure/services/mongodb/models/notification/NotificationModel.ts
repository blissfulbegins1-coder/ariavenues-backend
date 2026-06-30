import mongoose, { Schema } from "mongoose";
import { Notification } from "../../../../../domain/entities/Notification";
import UserRoles from "../../../../../domain/enums/UserRole";

const notificationSchema = new Schema<Notification>(
  {
    receiverId: {
      type: Schema.Types.ObjectId as any,
      ref: "User",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId as any,
      ref: "User",
      required: false,
      default: null,
    },
    role: {
      type: String,
      enum: [UserRoles.CUSTOMER, UserRoles.OWNER, UserRoles.ADMIN],
      required: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId as any,
      required: true,
    },
    referenceType: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
    },
    readAt: {
      type: Date,
      required: false,
      default: null,
    },
    delivered: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const NotificationModel = mongoose.model<Notification>(
  "Notification",
  notificationSchema,
  "notifications",
);
