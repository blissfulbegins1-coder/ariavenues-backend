import { Review } from "../../domain/entities/Review";
import { IReviewRepository } from "../../repositories/review/IReviewRepository";
import { IReviewEngine } from "./IReviewEngine";

type ReviewEngineConstructorParams = {
  reviewRepository: IReviewRepository;
};

export class ReviewEngine implements IReviewEngine {
  private reviewRepository: IReviewRepository;

  constructor({ reviewRepository }: ReviewEngineConstructorParams) {
    this.reviewRepository = reviewRepository;
  }

  async createReview(data: Partial<Review>): Promise<Review> {
    return await this.reviewRepository.create(data);
  }

  async getAuditoriumReviews(
    auditoriumId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<{ reviews: Review[]; total: number }> {
    return await this.reviewRepository.findByAuditorium(auditoriumId, page, limit);
  }

  async getReviewByUserAndAuditorium(userId: string, auditoriumId: string): Promise<Review | null> {
    return await this.reviewRepository.findByUserAndAuditorium(userId, auditoriumId);
  }

  async getReviewById(id: string): Promise<Review | null> {
    return await this.reviewRepository.findById(id);
  }

  async deleteReview(id: string): Promise<boolean> {
    return await this.reviewRepository.deleteReview(id);
  }
}
