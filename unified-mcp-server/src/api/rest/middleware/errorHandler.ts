import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../utils/logger';

/**
 * Error handler middleware for the REST API
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error(`API Error: ${err.message}`, { stack: err.stack });
  
  // Determine status code
  let statusCode = 500;
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
  }
  
  // Send error response
  res.status(statusCode).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

