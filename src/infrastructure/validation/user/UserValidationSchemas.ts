import * as yup from 'yup';

// Validation Schema for signing up a user
export const signUpSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(1, 'Name must be at least 1 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: yup
    .string()
    .optional()
    .email('Email must be a valid email address'),
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^\d{10,}$/, 'Mobile number must be at least 10 digits'),
  role: yup
    .string()
    .required('Role is required')
    .oneOf(['customer', 'owner', 'admin'], 'Invalid role'),
});

// Validation Schema for verifying OTP
export const verifyOtpSchema = yup.object().shape({
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^\d{10,}$/, 'Mobile number must be at least 10 digits'),
  otp: yup
    .string()
    .required('OTP is required')
    .matches(/^\d{4,6}$/, 'OTP must be 4 to 6 digits'),
});

// Validation Schema for resending OTP
export const resendOtpSchema = yup.object().shape({
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^\d{10,}$/, 'Mobile number must be at least 10 digits'),
});

// Validation Schema for ID parameter
export const idParamSchema = yup.object().shape({
  id: yup
    .string()
    .required('ID is required')
    .trim(),
});

// Validation Schema for signing in a user
export const signInSchema = yup.object().shape({
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^\d{10,}$/, 'Mobile number must be at least 10 digits'),
});

// Validation Schema for verifying sign in OTP
export const verifySignInOtpSchema = yup.object().shape({
  mobile: yup
    .string()
    .required('Mobile number is required')
    .matches(/^\d{10,}$/, 'Mobile number must be at least 10 digits'),
  otp: yup
    .string()
    .required('OTP is required')
    .matches(/^\d{4,6}$/, 'OTP must be 4 to 6 digits'),
});


