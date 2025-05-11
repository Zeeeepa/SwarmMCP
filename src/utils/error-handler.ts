import logger from './logger';

/**
 * Custom error class for MCP server errors
 */
export class MCPError extends Error {
  statusCode: number;
  errorCode: string;

  constructor(message: string, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler utility for standardized error responses
 */
export class ErrorHandler {
  /**
   * Handle an error and return a standardized error response
   * @param error - The error to handle
   * @returns Standardized error response object
   */
  static handle(error: Error | MCPError): Record<string, any> {
    // Log the error
    logger.error(`Error: ${error.message}`);
    logger.debug(`Stack: ${error.stack}`);

    // Determine status code and error code
    const statusCode = error instanceof MCPError ? error.statusCode : 500;
    const errorCode = error instanceof MCPError ? error.errorCode : 'INTERNAL_SERVER_ERROR';

    // Return standardized error response
    return {
      success: false,
      error: {
        message: error.message,
        code: errorCode,
        statusCode,
      },
    };
  }

  /**
   * Create a new MCPError with the specified parameters
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param errorCode - Custom error code
   * @returns New MCPError instance
   */
  static createError(message: string, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR'): MCPError {
    return new MCPError(message, statusCode, errorCode);
  }
}

export default ErrorHandler;

