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

// Validation Schema for resending OTP
export const resendOtpSchema = yup.object().shape({
  mobile: mobileValidation,
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