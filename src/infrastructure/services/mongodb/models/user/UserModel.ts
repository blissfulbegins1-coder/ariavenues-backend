import mongoose, { Schema } from 'mongoose';
import { User } from '../../../../../domain/entities/User';

// Mongoose Schema - defines MongoDB structure
const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'moderator'],
      default: 'user',
    },
  },
  { timestamps: true } // auto adds createdAt and updatedAt
);

export const UserModel = mongoose.model<User>('User', userSchema);
