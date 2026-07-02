import { Router, Request, Response, NextFunction } from "express";
import { AwilixContainer } from "awilix";
import { IContainer } from "../../ioc/registry";
import { requireRole } from "../../middleware/Auth/AuthMiddleware";
import UserRoles from "../../../domain/enums/UserRole";

export const setupAdminRoutes = (
  container: AwilixContainer<IContainer>
): Router => {
  const router = Router();
  const adminController = container.resolve("adminController");

  // Public admin auth routes
  router.post(
    "/signin",
    async (req: Request, res: Response, next: NextFunction) =>
      adminController.signIn(req, res, next)
  );

  router.post(
    "/verify-otp",
    async (req: Request, res: Response, next: NextFunction) =>
      adminController.verifyOtp(req, res, next)
  );

  router.post(
    "/resend-otp",
    async (req: Request, res: Response, next: NextFunction) =>
      adminController.resendOtp(req, res, next)
  );

  // Protected admin management routes
  router.get(
    "/dashboard-stats",
    requireRole([UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      adminController.getDashboardStats(req, res, next)
  );

  router.get(
    "/users",
    requireRole([UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      adminController.getUsers(req, res, next)
  );

  router.get(
    "/owners",
    requireRole([UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      adminController.getOwners(req, res, next)
  );

  router.get(
    "/auditoriums",
    requireRole([UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      adminController.getAuditoriums(req, res, next)
  );

  router.get(
    "/bookings",
    requireRole([UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      adminController.getBookings(req, res, next)
  );

  router.patch(
    "/auditoriums/:id/status",
    requireRole([UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      adminController.updateAuditoriumStatus(req, res, next)
  );

  router.patch(
    "/users/:id/status",
    requireRole([UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      adminController.updateUserStatus(req, res, next)
  );

  router.patch(
    "/bookings/:id/status",
    requireRole([UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      adminController.updateBookingStatus(req, res, next)
  );

  router.get(
    "/activities",
    requireRole([UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      adminController.getActivities(req, res, next)
  );

  return router;
};
