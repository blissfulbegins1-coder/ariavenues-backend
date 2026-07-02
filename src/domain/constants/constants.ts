import {
  OTP_AUTH_KEY,
  OTP_BASE_URL,
  OTP_TEMPLATE_ID,
  OTP_TIMEOUT,
  OTP_MOCK_VALUE,
  JWT_KEY,
  JWT_EXPIRY,
  SECRET,
  NODE_ENV,
} from "@/config/env";

export const auth_Key = OTP_AUTH_KEY;
export const baseUrl = OTP_BASE_URL;
export const templateId = OTP_TEMPLATE_ID;
export const otpTimeout = OTP_TIMEOUT;
export const otpMockValue = OTP_MOCK_VALUE;

export const jwtKey = JWT_KEY;
export const jwtExpiry = JWT_EXPIRY;
export const secret = SECRET;

export const REDIRECT_PATHS = {
  customer: "/",
  owner: "/owner/dashboard",
  admin: "/admin/dashboard",
} as const;

export const Environment = NODE_ENV;
