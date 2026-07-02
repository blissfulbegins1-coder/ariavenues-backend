import * as yup from "yup";
import { AuditoriumStatus } from "../../../domain/enums/AuditoriumStatus";
import { parseDDMMYYYY } from "../../../utils/dateUtils";

export const createAuditoriumSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(150, "Name must not exceed 150 characters"),
  description: yup
    .string()
    .required("Description is required")
    .trim()
    .min(10, "Description must be at least 10 characters"),
  address: yup.string().required("Address is required").trim(),
  state: yup.string().required("State is required").trim(),
  city: yup.string().required("City is required").trim(),
  district: yup.string().required("District is required").trim(),
  capacity: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === "") return undefined;
      const num = Number(originalValue);
      return isNaN(num) ? undefined : num;
    })
    .required("Capacity is required")
    .integer("Capacity must be an integer")
    .positive("Capacity must be positive")
    .min(1, "Capacity must be at least 1 seated person"),
  dayRate: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === "") return undefined;
      const num = Number(originalValue);
      return isNaN(num) ? undefined : num;
    })
    .required("Day rate is required")
    .positive("Day rate must be positive")
    .min(0, "Day rate cannot be negative"),
  amenities: yup
    .array()
    .of(yup.string().required())
    .transform((value, originalValue) => {
      if (typeof originalValue === "string") {
        try {
          return JSON.parse(originalValue);
        } catch (e) {
          return [];
        }
      }
      return value;
    })
    .required("Amenities are required")
    .min(1, "At least one amenity is required")
    .max(20, "Maximum of 20 amenities allowed"),
  images: yup
    .array()
    .required("Exactly 6 images are required")
    .min(6, "Exactly 6 images are required")
    .max(6, "Exactly 6 images are required"),
  status: yup
    .string()
    .optional()
    .oneOf(["pending", "draft", "maintenance", "active", "rejected", "blocked"], "Invalid status value")
    .default("draft"),
});

export const updateAuditoriumSchema = yup
  .object()
  .shape({
    name: yup
      .string()
      .required("Name is required")
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(150, "Name must not exceed 150 characters"),
    description: yup
      .string()
      .required("Description is required")
      .trim()
      .min(10, "Description must be at least 10 characters"),
    address: yup.string().required("Address is required").trim(),
    state: yup.string().required("State is required").trim(),
    city: yup.string().required("City is required").trim(),
    district: yup.string().required("District is required").trim(),
    capacity: yup
      .number()
      .transform((value, originalValue) => {
        if (originalValue === "") return undefined;
        const num = Number(originalValue);
        return isNaN(num) ? undefined : num;
      })
      .required("Capacity is required")
      .integer("Capacity must be an integer")
      .positive("Capacity must be positive")
      .min(1, "Capacity must be at least 1 seated person"),
    dayRate: yup
      .number()
      .transform((value, originalValue) => {
        if (originalValue === "") return undefined;
        const num = Number(originalValue);
        return isNaN(num) ? undefined : num;
      })
      .required("Day rate is required")
      .positive("Day rate must be positive")
      .min(0, "Day rate cannot be negative"),
    amenities: yup
      .array()
      .of(yup.string().required())
      .transform((value, originalValue) => {
        if (typeof originalValue === "string") {
          try {
            return JSON.parse(originalValue);
          } catch (e) {
            return [];
          }
        }
        return value;
      })
      .required("Amenities are required")
      .min(1, "At least one amenity is required")
      .max(20, "Maximum of 20 amenities allowed"),
    existingImages: yup
      .array()
      .of(yup.string().defined())
      .transform((value, originalValue) => {
        if (typeof originalValue === "string") {
          try {
            return JSON.parse(originalValue);
          } catch (e) {
            return [];
          }
        }
        return value;
      })
      .required("Existing images are required"),
    newImages: yup.array().optional().default([]),
    status: yup
      .string()
      .optional()
      .oneOf(["pending", "draft", "maintenance", "active", "rejected", "blocked"], "Invalid status value")
      .default("draft"),
  })
  .test(
    "total-images-must-be-6",
    "Exactly 6 images are required in total (existing and new combined)",
    function (value) {
      const existingCount = Array.isArray(value.existingImages)
        ? value.existingImages.filter(Boolean).length
        : 0;
      const newCount = Array.isArray(value.newImages)
        ? value.newImages.length
        : 0;
      return existingCount + newCount === 6;
    },
  );

export const auditoriumIdParamSchema = yup.object().shape({
  id: yup
    .string()
    .required("Auditorium ID is required")
    .trim()
    .matches(/^[a-f\d]{24}$/i, "Auditorium ID must be a valid MongoDB ObjectId"),
});

export const updateAuditoriumStatusSchema = yup.object().shape({
  status: yup
    .string()
    .required("Status is required")
    .oneOf([AuditoriumStatus.ACTIVE, AuditoriumStatus.REJECTED, AuditoriumStatus.BLOCKED], "Invalid status"),

  adminAdvance: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .optional()
    .min(0, "Admin advance must be a non-negative number"),

  auditoriumAdvance: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .optional()
    .min(0, "Auditorium advance must be a non-negative number"),
});

export const publicAuditoriumFilterSchema = yup.object().shape({
  destination: yup.string().optional().trim(),
  startDate: yup
    .date()
    .optional()
    .transform((value, originalValue) => {
      if (!originalValue) return null;
      if (typeof originalValue === "string") {
        return parseDDMMYYYY(originalValue);
      }
      return value;
    }),
  endDate: yup
    .date()
    .optional()
    .transform((value, originalValue) => {
      if (!originalValue) return null;
      if (typeof originalValue === "string") {
        return parseDDMMYYYY(originalValue);
      }
      return value;
    }),
  capacity: yup
    .number()
    .optional()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === undefined || originalValue === null) return null;
      const num = Number(originalValue);
      return isNaN(num) ? undefined : num;
    })
    .integer("Capacity must be an integer")
    .positive("Capacity must be positive"),
  minPrice: yup
    .number()
    .optional()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === undefined || originalValue === null) return null;
      const num = Number(originalValue);
      return isNaN(num) ? undefined : num;
    })
    .min(0, "Min price cannot be negative"),
  maxPrice: yup
    .number()
    .optional()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === undefined || originalValue === null) return null;
      const num = Number(originalValue);
      return isNaN(num) ? undefined : num;
    })
    .min(0, "Max price cannot be negative"),
  page: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" || originalValue === undefined || originalValue === null) ? 1 : Number(originalValue))
    .integer("Page must be an integer")
    .min(1, "Page must be at least 1")
    .default(1),
  limit: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" || originalValue === undefined || originalValue === null) ? 9 : Number(originalValue))
    .integer("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(9),
}).test(
  "date-range-valid",
  "Both startDate and endDate must be provided together, and startDate must be before or equal to endDate",
  function (value) {
    const { startDate, endDate } = value;
    if (startDate && !endDate) return false;
    if (!startDate && endDate) return false;
    if (startDate && endDate) {
      return new Date(startDate) <= new Date(endDate);
    }
    return true;
  }
).test(
  "price-range-valid",
  "minPrice must be less than or equal to maxPrice",
  function (value) {
    const { minPrice, maxPrice } = value;
    if (minPrice !== undefined && minPrice !== null && maxPrice !== undefined && maxPrice !== null) {
      return minPrice <= maxPrice;
    }
    return true;
  }
);

export const ownerAuditoriumsQuerySchema = yup.object().shape({
  page: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" || originalValue === undefined || originalValue === null) ? null : Number(originalValue))
    .optional()
    .nullable()
    .integer("Page must be an integer")
    .min(1, "Page must be at least 1"),
  limit: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" || originalValue === undefined || originalValue === null) ? null : Number(originalValue))
    .optional()
    .nullable()
    .integer("Limit must be an integer")
    .min(1, "Limit must be at least 1"),
  search: yup.string().optional().default(""),
});