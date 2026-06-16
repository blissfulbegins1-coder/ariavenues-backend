import { AppError } from "./AppError";
import { ErrorCode } from "./ErrorCode";

// Custom errors for business logic
export class UserNotFoundError extends AppError {
  constructor(identifier?: string) {
    super(
      identifier ? `User not found` : "User details not found",
      ErrorCode.UserNotFound,
    );
    this.name = "UserNotFoundError";
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(identifier: string) {
    super(`User already exists`, ErrorCode.UserAlreadyExists);
    this.name = "UserAlreadyExistsError";
  }
}

export class InvalidUserDataError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.InvalidUserData);
    this.name = "InvalidUserDataError";
  }
}
