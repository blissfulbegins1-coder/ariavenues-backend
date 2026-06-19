export class ApiError extends Error {
  errorDetails: string[] | undefined;

  constructor(
    msg: string,
    errorDetails?: string[]
  ) {
    super(msg);
    this.errorDetails = errorDetails;
  }
}
