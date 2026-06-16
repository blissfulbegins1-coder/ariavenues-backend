import { Request, Response, NextFunction } from "express";
import { JwtManagementEngine } from "../../../engines/jwt/JwtManagementEngine";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "customer" | "owner" | "admin";
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
            "Authorization header missing or invalid format (Bearer token required)",
        });
        return;
      }

      const token = authHeader.split(" ")[1];
      const jwtEngine = req.container.resolve<JwtManagementEngine>(
        "jwtManagementEngine",
      );
      const decoded = jwtEngine.verifyToken(token) as {
        id: string;
        role: "customer" | "owner" | "admin";
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
