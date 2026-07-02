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
