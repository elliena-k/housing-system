import type { Request } from 'express';
import type { AuthUser } from '../middleware/auth.js';
import { AppError } from './AppError.js';

export function currentUser(request: Request): AuthUser {
  if (!request.user) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Sign in to continue.');
  }
  return request.user;
}
