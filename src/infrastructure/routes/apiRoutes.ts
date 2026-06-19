import { Router } from "express";
import { AwilixContainer } from "awilix";
import { IContainer } from "../ioc/registry";
import { setupUserRoutes } from "./user/userRoutes";
import { setupAuditoriumRoutes } from "./auditorium/auditoriumRoutes";
import { setupBookingRoutes } from "./booking/bookingRoutes";
import { setupPaymentRoutes } from "./payment/paymentRoutes";
import { setupAdminRoutes } from "./admin/adminRoutes";

export const setupApiRoutes = (
  container: AwilixContainer<IContainer>,
): Router => {
  const router = Router();

  // Mount User Routes under /user
  router.use("/user", setupUserRoutes(container));

  // Mount Auditorium Routes under /auditorium
  router.use("/auditorium", setupAuditoriumRoutes(container));

  // Mount Booking Routes under /booking
  router.use("/booking", setupBookingRoutes(container));

  // Mount Payment Routes under /payment
  router.use("/payment", setupPaymentRoutes(container));

  // Mount Admin Routes under /admin
  router.use("/admin", setupAdminRoutes(container));

  return router;
};
