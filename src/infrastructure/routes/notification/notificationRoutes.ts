import { Router, Request, Response, NextFunction } from "express";
import { AwilixContainer } from "awilix";
import { IContainer } from "../../ioc/registry";
import { requireRole } from "../../middleware/Auth/AuthMiddleware";
import UserRoles from "../../../domain/enums/UserRole";

export const setupNotificationRoutes = (
  container: AwilixContainer<IContainer>,
): Router => {
  const router = Router();
  const notificationController = container.resolve("notificationController");

  router.get(
    "/my",
    requireRole([UserRoles.CUSTOMER, UserRoles.OWNER, UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      notificationController.getMyNotifications(req, res, next),
  );

  router.patch(
    "/read-all",
    requireRole([UserRoles.CUSTOMER, UserRoles.OWNER, UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      notificationController.markAllAsRead(req, res, next),
  );

  router.patch(
    "/:id/read",
    requireRole([UserRoles.CUSTOMER, UserRoles.OWNER, UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      notificationController.markAsRead(req, res, next),
  );

  return router;
};
