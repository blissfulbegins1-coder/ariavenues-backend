import { Review } from "../../domain/entities/Review";
import { CreateReviewDTO } from "../../domain/dtos/review/ReviewDto";
import UserTokenDto from "../../domain/dtos/user/UserTokenDto";
import { IReviewEngine } from "../../engines/review/IReviewEngine";
import { IAuditoriumEngine } from "../../engines/auditorium/IAuditoriumEngine";
import { IUserEngine } from "../../engines/user/IUserEngine";
import { ApiError } from "../../domain/errors/ApiError";
import { IReviewUseCase } from "./IReviewUseCase";
import { HttpStatus } from "../../domain/enums/HttpStatus";

type ReviewUseCaseConstructorParams = {
  reviewEngine: IReviewEngine;
  auditoriumEngine: IAuditoriumEngine;
  userEngine: IUserEngine;
};

export class ReviewUseCase implements IReviewUseCase {
  private reviewEngine: IReviewEngine;
  private auditoriumEngine: IAuditoriumEngine;
  private userEngine: IUserEngine;

  constructor({
    reviewEngine,
    auditoriumEngine,
    userEngine,
  }: ReviewUseCaseConstructorParams) {
    this.reviewEngine = reviewEngine;
    this.auditoriumEngine = auditoriumEngine;
    this.userEngine = userEngine;
  }

  async addReview(user: UserTokenDto, data: CreateReviewDTO): Promise<Review> {
    const auditorium = await this.auditoriumEngine.getAuditoriumById(data.auditoriumId);
    if (!auditorium) {
      throw new ApiError("Auditorium not found", HttpStatus.NOT_FOUND);
    }

    const existingReview = await this.reviewEngine.getReviewByUserAndAuditorium(user.id, data.auditoriumId);
    if (existingReview) {
      throw new ApiError("You have already reviewed this auditorium", HttpStatus.BAD_REQUEST);
    }

    const dbUser = await this.userEngine.getUserByMobile(user.mobile);
    const userName = dbUser ? dbUser.name : "Anonymous";

    // Create the review
    const review = await this.reviewEngine.createReview({
      userId: user.id,
      userName,
      auditoriumId: data.auditoriumId,
      rating: data.rating,
      comment: data.comment,
    });

    // Re-calculate rating stats for the auditorium
    const oldTotal = auditorium.totalReviews || 0;
    const oldAverage = auditorium.averageRating || 0;
    const newTotal = oldTotal + 1;
    const newAverage = (oldAverage * oldTotal + data.rating) / newTotal;

    await this.auditoriumEngine.updateAuditorium(data.auditoriumId, {
      totalReviews: newTotal,
      averageRating: Number(newAverage.toFixed(2)),
    });

    return review;
  }

  async listAuditoriumReviews(
    auditoriumId: string,
    page?: number | null,
    limit?: number | null,
  ): Promise<{ reviews: Review[]; total: number }> {
    return await this.reviewEngine.getAuditoriumReviews(auditoriumId, page, limit);
  }

  async deleteReview(user: UserTokenDto, id: string): Promise<boolean> {
    const review = await this.reviewEngine.getReviewById(id);
    if (!review) {
      throw new ApiError("Review not found", HttpStatus.NOT_FOUND);
    }

    if (review.userId !== user.id) {
      throw new ApiError("You can only delete your own reviews", HttpStatus.FORBIDDEN);
    }

    const deleted = await this.reviewEngine.deleteReview(id);
    if (deleted) {
      const auditorium = await this.auditoriumEngine.getAuditoriumById(review.auditoriumId);
      if (auditorium) {
        const oldTotal = auditorium.totalReviews || 0;
        const oldAverage = auditorium.averageRating || 0;
        let newTotal = 0;
        let newAverage = 0;

        if (oldTotal > 1) {
          newTotal = oldTotal - 1;
          newAverage = (oldAverage * oldTotal - review.rating) / newTotal;
        }

        await this.auditoriumEngine.updateAuditorium(review.auditoriumId, {
          totalReviews: newTotal,
          averageRating: Number(newAverage.toFixed(2)),
        });
      }
    }
    return deleted;
  }
}
