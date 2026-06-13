export interface IJwtManagementEngine {
  generateToken(payload: object): string;
  verifyToken(token: string): object | null;
}
