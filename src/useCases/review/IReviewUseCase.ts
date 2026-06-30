import { Review } from "../../domain/entities/Review";
import { CreateReviewDTO } from "../../domain/dtos/review/ReviewDto";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";

export interface IReviewUseCase {
  addReview(user: UserTokenDto, data: CreateReviewDTO): Promise<Review>;
  listAuditoriumReviews(
    auditoriumId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<{ reviews: Review[]; total: number }>;
}
