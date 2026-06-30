import { Request, Response, NextFunction } from "express";
import { IReviewUseCase } from "../useCases/review/IReviewUseCase";
import { createReviewSchema } from "../domain/dtos/review/ReviewDto";
import UserTokenDto from "../domain/dtos/user/UserTokenDto";

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
      const { auditoriumId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await this.reviewUseCase.listAuditoriumReviews(auditoriumId as string, page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
