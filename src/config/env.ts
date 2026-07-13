export const PORT: number = parseInt(process.env.PORT!);
export const NODE_ENV: string = process.env.NODE_ENV!;
export const IS_DEV: boolean = NODE_ENV === "development";

export const DATABASE_URI: string = process.env.DATABASE_URI!;
export const DATABASE_NAME: string = process.env.DATABASE_NAME!;

export const JWT_EXPIRY: string = process.env.JWT_EXPIRY!;
export const SECRET: string = process.env.SECRET!;
export const OTP_AUTH_KEY: string = process.env.OTP_AUTH_KEY!;
export const OTP_BASE_URL: string = process.env.OTP_BASE_URL!;
export const OTP_TEMPLATE_ID: string = process.env.OTP_TEMPLATE_ID!;
export const OTP_TIMEOUT: string = process.env.OTP_TIMEOUT!;
export const OTP_MOCK_VALUE: string = process.env.OTP_MOCK_VALUE!;

export const CLOUD_NAME: string = process.env.CLOUD_NAME!;
export const CLOUD_API_KEY: string = process.env.CLOUD_API_KEY!;
export const CLOUD_API_SECRET: string = process.env.CLOUD_API_SECRET!;

export const RAZORPAY_KEY_ID: string = process.env.RAZORPAY_KEY_ID!;
export const RAZORPAY_KEY_SECRET: string = process.env.RAZORPAY_KEY_SECRET!;

export const RABBITMQ_URI: string = process.env.RABBITMQ_URI!;

export const CORS_ORIGINS: string[] = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];
