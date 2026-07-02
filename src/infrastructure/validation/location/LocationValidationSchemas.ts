import * as yup from "yup";

export const getDistrictsQuerySchema = yup.object().shape({
  state: yup
    .string()
    .required("State query parameter is required")
    .trim()
    .min(1, "State cannot be empty"),
});

export const getCitiesQuerySchema = yup.object().shape({
  state: yup
    .string()
    .required("State query parameter is required")
    .trim()
    .min(1, "State cannot be empty"),
  district: yup
    .string()
    .required("District query parameter is required")
    .trim()
    .min(1, "District cannot be empty"),
});
