import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../../../domain/enums/HttpStatus";
import { ApiError } from "../../../domain/errors/ApiError";

export const transactionSecurityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Allow health check and preflight requests to bypass this check
  if (req.method === "OPTIONS" || req.path === "/health") {
    return next();
  }

  const transactionId = req.headers["x-transaction-id"];

  if (!transactionId || typeof transactionId !== "string") {
    throw new ApiError("Missing x-transaction-id header", HttpStatus.BAD_REQUEST);
  }

  // Ensure it's exactly 24 characters and alphanumeric
  const isValid = /^[a-zA-Z0-9]{24}$/.test(transactionId);
  if (!isValid) {
    throw new ApiError("Invalid x-transaction-id format", HttpStatus.BAD_REQUEST);
  }

  next();
};
