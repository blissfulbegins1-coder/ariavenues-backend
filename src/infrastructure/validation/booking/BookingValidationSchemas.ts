import * as yup from "yup";

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
