import { Router, Request, Response, NextFunction } from "express";
import { AwilixContainer } from "awilix";
import { IContainer } from "../../ioc/registry";
import { requireRole } from "../../middleware/Auth/AuthMiddleware";
import UserRoles from "../../../domain/enums/UserRole";

export const setupPaymentRoutes = (
  container: AwilixContainer<IContainer>,
): Router => {
  const router = Router();
  const paymentController = container.resolve("paymentController");

  router.post(
    "/order",
    requireRole([UserRoles.OWNER]),
    async (req: Request, res: Response, next: NextFunction) =>
      paymentController.createOrder(req, res, next),
  );

  router.post(
    "/verify",
    requireRole([UserRoles.OWNER]),
    async (req: Request, res: Response, next: NextFunction) =>
      paymentController.verifyPayment(req, res, next),
  );

  return router;
};
