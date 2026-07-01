export type IJwtManagementEngine = {
  generateToken(payload: object): string;
  verifyToken(token: string): object | null;
}
