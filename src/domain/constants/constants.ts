export const auth_Key = process.env.OTP_AUTH_KEY!;
export const baseUrl = process.env.OTP_BASE_URL!;
export const templateId = process.env.OTP_TEMPLATE_ID!;
export const otpTimeout = process.env.OTP_TIMEOUT!;

export const jwtKey = process.env.JWT_KEY!;
export const jwtExpiry = process.env.JWT_EXPIRY!;
export const secret = process.env.SECRET!;
export const REDIRECT_PATHS = {
  customer: '/',
  owner: '/owner/dashboard',
  admin: '/admin/dashboard',
} as const;
