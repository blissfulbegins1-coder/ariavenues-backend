import { Review } from "../../domain/entities/Review";

export interface IReviewEngine {
  createReview(data: Partial<Review>): Promise<Review>;
  getAuditoriumReviews(
    auditoriumId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<{ reviews: Review[]; total: number }>;
}
