import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/portfolio';

/**
 * Global error handler middleware.
 * Catches unhandled errors and returns a structured JSON response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message);
  console.error(err.stack);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  const errorResponse: ApiError = {
    error: statusCode === 500 ? 'Internal Server Error' : 'Request Failed',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong. Please try again later.',
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 handler for undefined routes.
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const errorResponse: ApiError = {
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(errorResponse);
}
