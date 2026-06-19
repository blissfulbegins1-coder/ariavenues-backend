import mongoose, { Schema } from "mongoose";
import { User } from "../../../../../domain/entities/User";
import UserStatus from "../../../../../domain/enums/UserStatus";
import UserRoles from "../../../../../domain/enums/UserRole";

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
      enum: [UserRoles.CUSTOMER, UserRoles.OWNER],
      required: true,
    },
    status: {
      type: String,
      enum: [UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED],
      required: true,
      default: UserStatus.ACTIVE,
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
