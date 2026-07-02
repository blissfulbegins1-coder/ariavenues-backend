import * as yup from "yup";

export const notificationQuerySchema = yup.object().shape({
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

export const notificationIdParamSchema = yup.object().shape({
  id: yup
    .string()
    .required()
    .matches(/^[a-f\d]{24}$/i, "Invalid Notification ID"),
});
