import { Router, Request, Response, NextFunction } from "express";
import { AwilixContainer } from "awilix";
import { IContainer } from "../../ioc/registry";

export const setupLocationRoutes = (
  container: AwilixContainer<IContainer>,
): Router => {
  const router = Router();
  const locationController = container.resolve("locationController");

  router.get("/", async (req: Request, res: Response, next: NextFunction) =>
    locationController.getAll(req, res, next)
  );

  router.get("/states", async (req: Request, res: Response, next: NextFunction) =>
    locationController.getStates(req, res, next)
  );

  router.get("/districts", async (req: Request, res: Response, next: NextFunction) =>
    locationController.getDistricts(req, res, next)
  );

  router.get("/cities", async (req: Request, res: Response, next: NextFunction) =>
    locationController.getCities(req, res, next)
  );

  return router;
};
