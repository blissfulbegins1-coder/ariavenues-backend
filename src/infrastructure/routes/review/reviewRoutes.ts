import { Router, Request, Response, NextFunction } from "express";
import { AwilixContainer } from "awilix";
import { IContainer } from "../../ioc/registry";
import { requireRole } from "../../middleware/Auth/AuthMiddleware";
import UserRoles from "../../../domain/enums/UserRole";
import { ReviewController } from "../../../controllers/ReviewController";

export const setupReviewRoutes = (
  container: AwilixContainer<IContainer>,
): Router => {
  const router = Router();
  const reviewController = container.resolve("reviewController") as ReviewController;

  router.post(
    "/",
    requireRole([UserRoles.CUSTOMER]),
    async (req: Request, res: Response, next: NextFunction) =>
      reviewController.addReview(req, res, next),
  );

  router.get(
    "/auditorium/:auditoriumId",
    async (req: Request, res: Response, next: NextFunction) =>
      reviewController.getReviewsByAuditorium(req, res, next),
  );

  router.delete(
    "/:id",
    requireRole([UserRoles.CUSTOMER]),
    async (req: Request, res: Response, next: NextFunction) =>
      reviewController.deleteReview(req, res, next),
  );

  return router;
};
