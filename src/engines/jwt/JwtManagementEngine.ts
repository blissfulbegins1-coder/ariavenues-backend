import jwt, { SignOptions } from "jsonwebtoken";
import { jwtExpiry, secret } from "../../domain/constants/constants";
import { IJwtManagementEngine } from "./IJwtManagementEngine";

export class JwtManagementEngine implements IJwtManagementEngine {
  generateToken(payload: object): string {
    return jwt.sign(payload, secret, {
      expiresIn: jwtExpiry as unknown as SignOptions["expiresIn"],
    });
  }

  verifyToken(token: string): object | null {
    try {
      return jwt.verify(token, secret) as object;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  }
}
