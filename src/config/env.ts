export const PORT: number = parseInt(process.env.PORT!);
export const NODE_ENV: string = process.env.NODE_ENV!;
export const IS_DEV: boolean = NODE_ENV === "development";

export const DATABASE_URI: string = process.env.DATABASE_URI!;
export const DATABASE_NAME: string = process.env.DATABASE_NAME!;

export const JWT_EXPIRY: string = process.env.JWT_EXPIRY!;
export const SECRET: string = process.env.SECRET!;

export const ADMIN_LOGIN_OTP: string = process.env.ADMIN_LOGIN_OTP!;

export const CLOUD_NAME: string = process.env.CLOUD_NAME!;
export const CLOUD_API_KEY: string = process.env.CLOUD_API_KEY!;
export const CLOUD_API_SECRET: string = process.env.CLOUD_API_SECRET!;

export const RAZORPAY_KEY_ID: string = process.env.RAZORPAY_KEY_ID!;
export const RAZORPAY_KEY_SECRET: string = process.env.RAZORPAY_KEY_SECRET!;

export const RABBITMQ_URI: string = process.env.RABBITMQ_URI!;

export const FIXED_BOOKING_AMOUNT: number = parseInt(process.env.FIXED_BOOKING_AMOUNT!);

export const RATE_LIMIT_WINDOW_MS: number = parseInt(process.env.RATE_LIMIT_WINDOW_MS!, 10);
export const RATE_LIMIT_MAX_REQUESTS: number = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS!, 10);

export const CORS_ORIGINS: string[] = process.env.CORS_ORIGINS!.split(",").map((origin) => origin.trim());