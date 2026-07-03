import { Review } from "../../domain/entities/Review";

export type IReviewRepository = {
  create(data: Partial<Review>): Promise<Review>;
  findByAuditorium(
    auditoriumId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<{ reviews: Review[]; total: number }>;
  findByUserAndAuditorium(userId: string, auditoriumId: string): Promise<Review | null>;
  findById(id: string): Promise<Review | null>;
  deleteReview(id: string): Promise<boolean>;
}
