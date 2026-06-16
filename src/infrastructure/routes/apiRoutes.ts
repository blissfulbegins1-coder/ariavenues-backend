import { Router } from "express";
import { AwilixContainer } from "awilix";
import { IContainer } from "../ioc/registry";
import { setupUserRoutes } from "./user/userRoutes";
import { setupAuditoriumRoutes } from "./auditorium/auditoriumRoutes";

// Main API Router - centralizes all API routes
export const setupApiRoutes = (
  container: AwilixContainer<IContainer>,
): Router => {
  const router = Router();

  // Mount User Routes under /user
  router.use("/user", setupUserRoutes(container));

  // Mount Auditorium Routes under /auditorium
  router.use("/auditorium", setupAuditoriumRoutes(container));

  // Mount other routes as needed
  // router.use('/admin', setupAdminRoutes(container));

  return router;
};
