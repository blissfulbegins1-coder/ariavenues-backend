import { Review } from "../../domain/entities/Review";

export interface IReviewRepository {
  create(data: Partial<Review>): Promise<Review>;
  findByAuditorium(
    auditoriumId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<{ reviews: Review[]; total: number }>;
}
