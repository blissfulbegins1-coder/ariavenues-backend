export const ErrorCode = {
  UserNotFound: 404,
  UserAlreadyExists: 409,
  InvalidUserData: 400,
  Unauthorized: 401,
  Forbidden: 403,
  InternalServerError: 500,
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
