import * as yup from "yup";

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
    .oneOf(["draft", "maintenance", "active"], "Invalid status value")
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
      .oneOf(["draft", "maintenance", "active"], "Invalid status value")
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

