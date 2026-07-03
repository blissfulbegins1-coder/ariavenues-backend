import * as yup from "yup";

export const getReviewsQuerySchema = yup.object().shape({
  page: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" || originalValue === undefined || originalValue === null) ? null : Number(originalValue))
    .optional()
    .nullable()
    .integer()
    .min(1),
  limit: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" || originalValue === undefined || originalValue === null) ? null : Number(originalValue))
    .optional()
    .nullable()
    .integer()
    .min(1),
});
export const getReviewsParamSchema = yup.object().shape({
  auditoriumId: yup
    .string()
    .required("Auditorium ID is required")
    .trim()
    .matches(/^[a-f\d]{24}$/i, "Auditorium ID must be a valid MongoDB ObjectId"),
});
export const deleteReviewParamSchema = yup.object().shape({
  id: yup
    .string()
    .required("Review ID is required")
    .trim()
    .matches(/^[a-f\d]{24}$/i, "Review ID must be a valid MongoDB ObjectId"),
});
