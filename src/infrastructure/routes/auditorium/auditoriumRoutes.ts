import { Router, Request, Response, NextFunction } from "express";
import { AwilixContainer } from "awilix";
import { IContainer } from "../../ioc/registry";
import { requireRole, optionalAuthenticate } from "../../middleware/Auth/AuthMiddleware";
import UserRoles from "../../../domain/enums/UserRole";

export const setupAuditoriumRoutes = (
  container: AwilixContainer<IContainer>,
): Router => {
  const router = Router();
  const auditoriumController = container.resolve("auditoriumController");

  router.post(
    "/",
    requireRole([UserRoles.OWNER]),
    async (req: Request, res: Response, next: NextFunction) =>
      auditoriumController.create(req, res, next),
  );

  router.get(
    "/my",
    requireRole([UserRoles.OWNER]),
    async (req: Request, res: Response, next: NextFunction) =>
      auditoriumController.getMyAuditoriums(req, res, next),
  );

  router.get("/", async (req: Request, res: Response, next: NextFunction) =>
    auditoriumController.getPublicAuditoriums(req, res, next),
  );

  router.get(
    "/:id",
    optionalAuthenticate,
    async (req: Request, res: Response, next: NextFunction) =>
      auditoriumController.getAuditoriumById(req, res, next),
  );

  router.get(
    "/:id/booked-details",
    requireRole([UserRoles.CUSTOMER]),
    async (req: Request, res: Response, next: NextFunction) =>
      auditoriumController.getBookedAuditoriumDetails(req, res, next),
  );

  router.put(
    "/:id",
    requireRole([UserRoles.OWNER]),
    async (req: Request, res: Response, next: NextFunction) =>
      auditoriumController.update(req, res, next),
  );

  return router;
};
