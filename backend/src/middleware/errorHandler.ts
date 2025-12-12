import { Request, Response, NextFunction } from 'express'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
}

/**
 * Centralized error handling middleware
 * Returns consistent JSON error responses
 */
export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Default to 500 if no status code is set
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      code: err.code,
    })
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    code: err.code,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

/**
 * Create an API error with status code and optional error code
 */
export function createError(
  message: string,
  statusCode: number = 500,
  code?: string
): ApiError {
  const error: ApiError = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}





