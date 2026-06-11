import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

// Error Handling Middleware - centralizes error responses
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Handle Yup Validation Errors
  if (err instanceof yup.ValidationError) {
    const validationErrors: Record<string, string[]> = {};
    err.inner.forEach((error) => {
      const field = error.path || 'unknown';
      if (!validationErrors[field]) {
        validationErrors[field] = [];
      }
      validationErrors[field].push(error.message);
    });

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: validationErrors,
    });
    return;
  }

  // Handle other errors
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${status}] ${message}`, err);

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
