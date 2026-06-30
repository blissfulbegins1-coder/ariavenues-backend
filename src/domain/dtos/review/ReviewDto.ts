import * as yup from "yup";

export interface CreateReviewDTO {
  auditoriumId: string;
  rating: number;
  comment: string;
}

export const createReviewSchema = yup.object().shape({
  auditoriumId: yup
    .string()
    .required("Auditorium ID is required")
    .matches(/^[a-f\d]{24}$/i, "Invalid Auditorium ID"),
  rating: yup
    .number()
    .required("Rating is required")
    .integer("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: yup
    .string()
    .required("Comment is required")
    .trim()
    .min(3, "Comment must be at least 3 characters")
    .max(500, "Comment cannot exceed 500 characters"),
});
