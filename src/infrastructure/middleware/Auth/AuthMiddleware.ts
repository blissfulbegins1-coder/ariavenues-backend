import { Request, Response, NextFunction } from "express";
import { JwtManagementEngine } from "../../../engines/jwt/JwtManagementEngine";
import UserRoles from "../../../domain/enums/UserRole";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        mobile: string;
      };
    }
  }
}

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message:
            "Authorization header missing or invalid format (token required)",
        });
        return;
      }

      const token = authHeader.split(" ")[1];
      const jwtEngine = req.container.resolve<JwtManagementEngine>(
        "jwtManagementEngine",
      );
      const decoded = jwtEngine.verifyToken(token) as {
        id: string;
        role: UserRoles.ADMIN | UserRoles.CUSTOMER | UserRoles.OWNER;
        mobile: string;
      } | null;

      if (!decoded) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired access token",
        });
        return;
      }

      if (!allowedRoles.includes(decoded.role)) {
        res.status(403).json({
          success: false,
          message: "Access denied. Unauthorized role hierarchy",
        });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const jwtEngine = req.container.resolve<JwtManagementEngine>(
        "jwtManagementEngine",
      );
      const decoded = jwtEngine.verifyToken(token) as {
        id: string;
        role: UserRoles.ADMIN | UserRoles.CUSTOMER | UserRoles.OWNER;
        mobile: string;
      } | null;

      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    next();
  }
};
