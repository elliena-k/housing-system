import { ApiError } from './api';

export interface ErrorInfo {
  message: string;
  code?: string;
}

export function errorInfo(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): ErrorInfo {
  if (error instanceof ApiError) {
    return { message: error.message, code: error.code };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: fallback };
}
