import * as yup from 'yup';

export const createAuditoriumSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(150, 'Name must not exceed 150 characters'),
  description: yup
    .string()
    .required('Description is required')
    .trim()
    .min(10, 'Description must be at least 10 characters'),
  address: yup
    .string()
    .required('Address is required')
    .trim(),
  capacity: yup
    .number()
    .required('Capacity is required')
    .integer('Capacity must be an integer')
    .positive('Capacity must be positive')
    .min(1, 'Capacity must be at least 1 seated person'),
  dayRate: yup
    .number()
    .required('Day rate is required')
    .positive('Day rate must be positive')
    .min(0, 'Day rate cannot be negative'),
  amenities: yup
    .array()
    .of(yup.string().required())
    .required('Amenities are required')
    .min(1, 'At least one amenity is required')
    .max(20, 'Maximum of 20 amenities allowed'),
  images: yup
    .array()
    .of(yup.string().url('Each image must be a valid URL').required())
    .required('Images are required')
    .min(6, 'Exactly 6 images are required')
    .max(6, 'Exactly 6 images are required'),
  status: yup
    .string()
    .optional()
    .oneOf(['draft', 'maintenance', 'active'], 'Invalid status value')
    .default('draft'),
});
