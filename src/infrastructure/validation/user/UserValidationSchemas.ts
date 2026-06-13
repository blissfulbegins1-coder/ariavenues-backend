import * as yup from 'yup';

// Validation Schema for creating a user
export const createUserSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Email must be a valid email address'),
  phone: yup
    .string()
    .required('Phone is required')
    .matches(/^\d{10,}$/, 'Phone must be at least 10 digits'),
  role: yup
    .string()
    .oneOf(['admin', 'user', 'moderator'], 'Invalid role')
    .default('user'),
});

// Validation Schema for ID parameter
export const idParamSchema = yup.object().shape({
  id: yup
    .string()
    .required('ID is required')
    .trim(),
});
