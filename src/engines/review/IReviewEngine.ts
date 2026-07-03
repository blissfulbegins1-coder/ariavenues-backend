import { Review } from "../../domain/entities/Review";

export type IReviewEngine = {
  createReview(data: Partial<Review>): Promise<Review>;
  getAuditoriumReviews(
    auditoriumId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<{ reviews: Review[]; total: number }>;
  getReviewByUserAndAuditorium(userId: string, auditoriumId: string): Promise<Review | null>;
  getReviewById(id: string): Promise<Review | null>;
  deleteReview(id: string): Promise<boolean>;
}
