import { Router, Request, Response, NextFunction } from "express";
import { AwilixContainer } from "awilix";
import { IContainer } from "../../ioc/registry";
import { requireRole } from "../../middleware/Auth/AuthMiddleware";

export const setupBookingRoutes = (
  container: AwilixContainer<IContainer>,
): Router => {
  const router = Router();
  const bookingController = container.resolve("bookingController");

  router.post(
    "/",
    requireRole(["customer"]),
    async (req: Request, res: Response, next: NextFunction) =>
      bookingController.create(req, res, next),
  );

  router.get(
    "/my",
    requireRole(["customer"]),
    async (req: Request, res: Response, next: NextFunction) =>
      bookingController.getCustomerBookings(req, res, next),
  );

  router.get(
    "/owner/dashboard",
    requireRole(["owner"]),
    async (req: Request, res: Response, next: NextFunction) =>
      bookingController.getOwnerDashboardStats(req, res, next),
  );

  router.get(
    "/owner",
    requireRole(["owner"]),
    async (req: Request, res: Response, next: NextFunction) =>
      bookingController.getOwnerBookings(req, res, next),
  );

  router.get(
    "/:id",
    requireRole(["customer"]),
    async (req: Request, res: Response, next: NextFunction) =>
      bookingController.getBookingById(req, res, next),
  );

  router.delete(
    "/:id",
    requireRole(["customer"]),
    async (req: Request, res: Response, next: NextFunction) =>
      bookingController.cancelBooking(req, res, next),
  );

  router.get(
    "/public/auditorium/:auditoriumId",
    async (req: Request, res: Response, next: NextFunction) =>
      bookingController.getPublicBookingsForAuditorium(req, res, next),
  );

  return router;
};
