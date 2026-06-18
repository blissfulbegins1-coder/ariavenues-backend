import mongoose, { Schema } from "mongoose";
import { User } from "../../../../../domain/entities/User";

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    mobileVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: String,
      enum: ["customer", "owner", "admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "blocked", "deleted"],
      required: true,
      default: "active",
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<User>("User", userSchema);
