import { Router, Request, Response, NextFunction } from "express";
import { AwilixContainer } from "awilix";
import { IContainer } from "../../ioc/registry";
import { requireRole } from "../../middleware/Auth/AuthMiddleware";

export const setupNotificationRoutes = (
  container: AwilixContainer<IContainer>,
): Router => {
  const router = Router();
  const notificationController = container.resolve("notificationController");

  router.get(
    "/my",
    requireRole(["customer", "owner", "admin"]),
    async (req: Request, res: Response, next: NextFunction) =>
      notificationController.getMyNotifications(req, res, next),
  );

  router.patch(
    "/read-all",
    requireRole(["customer", "owner", "admin"]),
    async (req: Request, res: Response, next: NextFunction) =>
      notificationController.markAllAsRead(req, res, next),
  );

  router.patch(
    "/:id/read",
    requireRole(["customer", "owner", "admin"]),
    async (req: Request, res: Response, next: NextFunction) =>
      notificationController.markAsRead(req, res, next),
  );

  return router;
};
