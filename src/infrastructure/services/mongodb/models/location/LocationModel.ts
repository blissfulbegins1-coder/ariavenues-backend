import mongoose, { Schema } from "mongoose";
import { Location } from "../../../../../domain/entities/Location";

const locationSchema = new Schema<Location>(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: false }
);

export const LocationModel = mongoose.model<Location>(
  "Location",
  locationSchema,
  "locations"
);
