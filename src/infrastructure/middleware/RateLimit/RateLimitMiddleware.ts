import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger";
import { HttpStatus } from "../../../domain/enums/HttpStatus";
import { ApiError } from "../../../domain/errors/ApiError";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from "../../../config/env";

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const ipRequestMap = new Map<string, RateLimitRecord>();

const WINDOW_MS = RATE_LIMIT_WINDOW_MS;
const MAX_REQUESTS = RATE_LIMIT_MAX_REQUESTS;

export const rateLimitMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.method === "OPTIONS" || req.path === "/health") {
    return next();
  }

  const clientIp = (req.headers["x-forwarded-for"] as string) || req.ip || req.socket.remoteAddress || "unknown-ip";
  const now = Date.now();

  const record = ipRequestMap.get(clientIp);

  if (!record) {
    ipRequestMap.set(clientIp, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return next();
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + WINDOW_MS;
    return next();
  }

  record.count += 1;
  if (record.count > MAX_REQUESTS) {
    logger.warn(`Rate limit exceeded for IP: ${clientIp} on ${req.method} ${req.originalUrl}`);
    throw new ApiError("Too many requests from this IP, please try again later.", HttpStatus.TOO_MANY_REQUESTS);
  }

  next();
};

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestMap.entries()) {
    if (now > record.resetTime) {
      ipRequestMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);
