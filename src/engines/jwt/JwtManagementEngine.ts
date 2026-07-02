import jwt, { SignOptions } from "jsonwebtoken";
import { JWT_EXPIRY, SECRET } from "@/config/env";
import { IJwtManagementEngine } from "./IJwtManagementEngine";

export class JwtManagementEngine implements IJwtManagementEngine {
  generateToken(payload: object): string {
    return jwt.sign(payload, SECRET, {
      expiresIn: JWT_EXPIRY as unknown as SignOptions["expiresIn"],
    });
  }

  verifyToken(token: string): object | null {
    try {
      return jwt.verify(token, SECRET) as object;
    } catch (error) {
      return null;
    }
  }
}
