import { Router, Request, Response, NextFunction } from "express";
import { AwilixContainer } from "awilix";
import { IContainer } from "../../ioc/registry";
import { requireRole } from "../../middleware/Auth/AuthMiddleware";

export const setupReviewRoutes = (
  container: AwilixContainer<IContainer>,
): Router => {
  const router = Router();
  const reviewController = container.resolve("reviewController") as any;

  router.post(
    "/",
    requireRole(["customer"]),
    async (req: Request, res: Response, next: NextFunction) =>
      reviewController.addReview(req, res, next),
  );

  router.get(
    "/auditorium/:auditoriumId",
    async (req: Request, res: Response, next: NextFunction) =>
      reviewController.getReviewsByAuditorium(req, res, next),
  );

  return router;
};
