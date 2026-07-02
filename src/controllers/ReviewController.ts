import { Request, Response, NextFunction } from "express";
import { IReviewUseCase } from "../useCases/review/IReviewUseCase";
import { createReviewSchema } from "../domain/dtos/review/ReviewDto";
import UserTokenDto from "../domain/dtos/user/UserTokenDto";
import { getReviewsQuerySchema, getReviewsParamSchema } from "../infrastructure/validation/review/ReviewValidationSchemas";

type ReviewControllerConstructorParams = {
  reviewUseCase: IReviewUseCase;
};

export class ReviewController {
  private reviewUseCase: IReviewUseCase;

  constructor({ reviewUseCase }: ReviewControllerConstructorParams) {
    this.reviewUseCase = reviewUseCase;
  }

  async addReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as UserTokenDto;
      const validatedBody = await createReviewSchema.validate(req.body, { abortEarly: false });

      const review = await this.reviewUseCase.addReview(user, validatedBody);

      res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReviewsByAuditorium(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { auditoriumId } = await getReviewsParamSchema.validate(req.params, {
        abortEarly: false,
      });
      const validatedQuery = await getReviewsQuerySchema.validate(req.query, {
        abortEarly: false,
      });

      const result = await this.reviewUseCase.listAuditoriumReviews(
        auditoriumId,
        validatedQuery.page ?? 1,
        validatedQuery.limit ?? 10,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
