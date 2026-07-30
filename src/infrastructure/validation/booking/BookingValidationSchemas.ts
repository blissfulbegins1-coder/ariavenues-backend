import * as yup from "yup";
import { BookingStatus } from "../../../domain/enums/BookingStatus";

export const createOwnerBookingSchema = yup.object().shape({
  auditoriumId: yup.string().required("Auditorium is required").trim(),
  userName: yup.string().required("Customer name is required").trim(),
  userMobile: yup
    .string()
    .required("Mobile number is required")
    .trim()
    .matches(/^\d{10}$/, "Mobile number must be a valid 10-digit number"),
  bookingDate: yup
    .string()
    .required("Booking date is required")
    .trim()
    .matches(/^\d{2}-\d{2}-\d{4}$/, "Booking date must be in DD-MM-YYYY format"),
  startTime: yup.string().required("Start time is required").trim(),
  endTime: yup.string().required("End time is required").trim(),
});

export const bookingIdParamSchema = yup.object().shape({
  id: yup
    .string()
    .required("Booking ID is required")
    .trim()
    .matches(/^[a-f\d]{24}$/i, "Booking ID must be a valid MongoDB ObjectId"),
});

export const updateBookingStatusSchema = yup.object().shape({
  status: yup
    .string()
    .required("Status is required")
    .oneOf([BookingStatus.CONFIRMED, BookingStatus.CANCELLED], "Invalid status"),
});

export const getPublicBookingsSchema = yup.object().shape({
  auditoriumId: yup
    .string()
    .required("Auditorium ID is required")
    .trim()
    .matches(/^[a-f\d]{24}$/i, "Auditorium ID must be a valid MongoDB ObjectId"),
  startDate: yup
    .string()
    .required("Start date is required")
    .trim()
    .matches(/^\d{2}-\d{2}-\d{4}$/, {
      message: "Start date must be in DD-MM-YYYY format",
    }),
  endDate: yup
    .string()
    .required("End date is required")
    .trim()
    .matches(/^\d{2}-\d{2}-\d{4}$/, {
      message: "End date must be in DD-MM-YYYY format",
    }),
});

export const ownerDashboardStatsQuerySchema = yup.object().shape({
  year: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" || originalValue === undefined || originalValue === null) ? null : Number(originalValue))
    .optional()
    .nullable()
    .integer("Year must be an integer")
    .min(2000, "Year must be 2000 or later"),
  month: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" || originalValue === undefined || originalValue === null) ? null : Number(originalValue))
    .optional()
    .nullable()
    .integer("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
}).transform((value) => {
  if (!value) return value;
  const targetYear = value.year ?? new Date().getFullYear();
  let statsStart: Date;
  let statsEnd: Date;
  if (value.month) {
    statsStart = new Date(targetYear, value.month - 1, 1);
    statsEnd   = new Date(targetYear, value.month, 0, 23, 59, 59, 999);
  } else {
    statsStart = new Date(targetYear, 0, 1);
    statsEnd   = new Date(targetYear, 11, 31, 23, 59, 59, 999);
  }
  return {
    ...value,
    statsStart,
    statsEnd,
    targetYear,
  };
});