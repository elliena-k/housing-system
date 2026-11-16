import type { UserRole } from '@housing/shared';
import type { RequestHandler } from 'express';
import { getSupabaseAdmin } from '../config/supabase.js';
import type { ProfileRow } from '../types/rows.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export interface AuthUser {
  id: string;
  role: UserRole;
  isActive: boolean;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export const authenticate: RequestHandler = asyncHandler(async (request, _response, next) => {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Sign in to continue.');
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Sign in to continue.');
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);

  if (error || !data.user) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Your session is invalid or has expired.');
  }

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, role, is_active')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    throw new AppError(500, 'PROFILE_LOOKUP_FAILED', 'Could not load your profile.');
  }

  const row = profile as ProfileRow | null;
  if (!row) {
    throw new AppError(403, 'PROFILE_MISSING', 'Your account is incomplete.');
  }
  if (!row.is_active) {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'Your account has been deactivated.');
  }

  request.user = { id: row.id, role: row.role, isActive: row.is_active };
  next();
});

export function requireRole(role: UserRole): RequestHandler {
  return (request, _response, next) => {
    if (!request.user) {
      next(new AppError(401, 'UNAUTHENTICATED', 'Sign in to continue.'));
      return;
    }
    if (request.user.role !== role) {
      next(new AppError(403, 'FORBIDDEN', 'You do not have access to this resource.'));
      return;
    }
    next();
  };
}
