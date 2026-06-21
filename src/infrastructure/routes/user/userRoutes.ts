import { Router, Request, Response, NextFunction } from "express";
import { AwilixContainer } from "awilix";
import { IContainer } from "../../ioc/registry";
import { requireRole } from "../../middleware/Auth/AuthMiddleware";
import UserRoles from "../../../domain/enums/UserRole";

export const setupUserRoutes = (
  container: AwilixContainer<IContainer>,
): Router => {
  const router = Router();
  const userController = container.resolve("userController");

  router.post(
    "/signup",
    async (req: Request, res: Response, next: NextFunction) =>
      userController.signUp(req, res, next),
  );

  router.post(
    "/verify-otp",
    async (req: Request, res: Response, next: NextFunction) =>
      userController.verifyOtp(req, res, next),
  );

  router.post(
    "/resend-otp",
    async (req: Request, res: Response, next: NextFunction) =>
      userController.resendOtp(req, res, next),
  );

  router.post(
    "/signin",
    async (req: Request, res: Response, next: NextFunction) =>
      userController.signIn(req, res, next),
  );

  router.get(
    "/isAuth",
    requireRole([UserRoles.CUSTOMER, UserRoles.OWNER, UserRoles.ADMIN]),
    async (req: Request, res: Response, next: NextFunction) =>
      userController.checkAuth(req, res, next),
  );

  return router;
};
