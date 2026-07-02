import { HttpStatus } from "../enums/HttpStatus";

export class ApiError extends Error {
  statusCode: number;
  errorDetails: string[] | undefined;

  constructor(
    msg: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    errorDetails?: string[]
  ) {
    super(msg);
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
  }
}
