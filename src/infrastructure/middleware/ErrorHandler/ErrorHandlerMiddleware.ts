import { Request, Response, NextFunction } from "express";
import * as yup from "yup";
import { IS_DEV } from "@/config/env";
import { logger } from "@/utils/logger";

type HttpError = Error & {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(`Error on ${req.method} ${req.originalUrl}:`, err);

  if (err instanceof yup.ValidationError) {
    const validationErrors: Record<string, string[]> = {};
    err.inner.forEach((error) => {
      const field = error.path || "unknown";
      if (!validationErrors[field]) {
        validationErrors[field] = [];
      }
      validationErrors[field].push(error.message);
    });

    res.status(400).json({
      success: false,
      error: "Validation failed",
      errors: validationErrors,
    });
    return;
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    error: message,
    ...(IS_DEV && { stack: err.stack }),
  });
};
