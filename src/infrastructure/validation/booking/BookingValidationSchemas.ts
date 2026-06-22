import * as yup from "yup";
import { BookingStatus } from "../../../domain/enums/BookingStatus";

export const createBookingSchema = yup.object().shape({
  auditoriumId: yup.string().required("Auditorium ID is required").trim(),
  startDate: yup.string().required("Start date is required").trim(),
  endDate: yup.string().required("End date is required").trim(),
  guestCount: yup
    .number()
    .required("Expected guest count is required")
    .positive("Expected guest count must be a positive integer")
    .integer("Expected guest count must be an integer"),
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