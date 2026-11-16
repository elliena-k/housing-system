import type { ErrorRequestHandler } from 'express';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    });
    return;
  }

  logger.error({ err: error }, 'Unhandled error');
  response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong. Please try again.',
    },
  });
};
