import * as yup from "yup";
import UserRoles from "../../../domain/enums/UserRole";
import UserStatus from "../../../domain/enums/UserStatus";

const mobileValidation = yup
  .string()
  .required("Mobile number is required")
  .matches(
    /^(91)?\d{10}$/,
    "Mobile number must be a valid 10-digit number (optionally prefixed with 91)",
  );

// Validation Schema for signing up a user
export const signUpSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .trim()
    .min(1, "Name must be at least 1 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: yup
    .string()
    .optional()
    .trim()
    .transform((value) => (value ? value.toLowerCase() : value))
    .email("Email must be a valid email address"),
  mobile: mobileValidation,
  role: yup
    .string()
    .required("Role is required")
    .oneOf([UserRoles.OWNER, UserRoles.CUSTOMER], "Invalid role"),
});

// Validation Schema for verifying OTP
export const verifyOtpSchema = yup.object().shape({
  mobile: mobileValidation,
  otp: yup
    .string()
    .required("OTP is required")
    .matches(/^\d{6}$/, "OTP must be 6 digits"),
});

// Validation Schema for ID parameter
export const userIdParamSchema = yup.object().shape({
  id: yup.string().required("User ID is required").trim().matches(/^[a-f\d]{24}$/i, "User ID must be a valid MongoDB ObjectId"),
});

// Validation Schema for signing in a user
export const signInSchema = yup.object().shape({
  mobile: mobileValidation,
});


export const updateUserStatusSchema = yup.object().shape({
  status: yup
    .string()
    .required("Status is required")
    .oneOf([UserStatus.ACTIVE, UserStatus.BLOCKED], "Invalid status")
});

export const dashboardStatsQuerySchema = yup.object().shape({
  year: yup
    .number()
    .optional()
    .nullable()
    .transform((value, originalValue) => originalValue === "" ? null : value)
    .integer("Year must be an integer")
    .min(2000, "Year must be 2000 or later"),
  month: yup
    .number()
    .optional()
    .nullable()
    .transform((value, originalValue) => originalValue === "" ? null : value)
    .integer("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  startDate: yup.string().optional(),
  endDate: yup.string().optional(),
}).test("month-requires-year", "Year is required if Month is specified", (value) => {
  if (value.month && !value.year) {
    return false;
  }
  return true;
}).transform((value) => {
  if (!value) return value;
  let startDate: string | undefined;
  let endDate: string | undefined;

  if (value.year) {
    const year = value.year;
    if (value.month) {
      const month = value.month;
      const monthStr = String(month).padStart(2, "0");
      const lastDay = new Date(year, month, 0).getDate();
      const lastDayStr = String(lastDay).padStart(2, "0");
      startDate = `01-${monthStr}-${year}`;
      endDate = `${lastDayStr}-${monthStr}-${year}`;
    } else {
      startDate = `01-01-${year}`;
      endDate = `31-12-${year}`;
    }
  }

  return {
    ...value,
    startDate,
    endDate,
  };
});

export const adminBookingsQuerySchema = yup.object().shape({
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
  status: yup.string().oneOf(["all", "confirmed", "completed", "cancelled", "pending_payment", "revenue"]).optional().default("all"),
  sortBy: yup.string().oneOf(["recent", "oldest"]).optional().default("recent"),
  year: yup
    .number()
    .optional()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" || originalValue === undefined || originalValue === null) ? null : Number(originalValue))
    .integer("Year must be an integer")
    .min(2000, "Year must be 2000 or later"),
  month: yup
    .number()
    .optional()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" || originalValue === undefined || originalValue === null) ? null : Number(originalValue))
    .integer("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  startDate: yup.string().optional(),
  endDate: yup.string().optional(),
}).test("month-requires-year", "Year is required if Month is specified", (value) => {
  if (value.month && !value.year) {
    return false;
  }
  return true;
}).transform((value) => {
  if (!value) return value;
  let startDate: string | undefined;
  let endDate: string | undefined;

  if (value.year) {
    const year = value.year;
    if (value.month) {
      const month = value.month;
      const monthStr = String(month).padStart(2, "0");
      const lastDay = new Date(year, month, 0).getDate();
      const lastDayStr = String(lastDay).padStart(2, "0");
      startDate = `01-${monthStr}-${year}`;
      endDate = `${lastDayStr}-${monthStr}-${year}`;
    } else {
      startDate = `01-01-${year}`;
      endDate = `31-12-${year}`;
    }
  }

  return {
    ...value,
    startDate,
    endDate,
  };
});

export const getActivitiesQuerySchema = yup.object().shape({
  page: yup
    .number()
    .optional()
    .default(1)
    .integer("Page must be an integer")
    .min(1, "Page must be at least 1"),
  limit: yup
    .number()
    .optional()
    .default(10)
    .integer("Limit must be an integer")
    .min(1, "Limit must be at least 1"),
});

export const adminUsersQuerySchema = yup.object().shape({
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
  status: yup.string().oneOf(["all", "active", "blocked"]).optional().default("all"),
  sortBy: yup.string().oneOf(["recent", "name"]).optional().default("recent"),
});

export const adminOwnersQuerySchema = yup.object().shape({
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
  status: yup.string().oneOf(["all", "active", "blocked"]).optional().default("all"),
  sortBy: yup.string().oneOf(["recent", "name"]).optional().default("recent"),
});

export const adminAuditoriumsQuerySchema = yup.object().shape({
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
  status: yup.string().oneOf(["all", "active", "pending", "rejected", "maintenance", "blocked"]).optional().default("all"),
  sortBy: yup.string().oneOf(["recent", "name"]).optional().default("recent"),
});