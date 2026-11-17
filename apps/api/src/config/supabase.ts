import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../utils/AppError.js';
import { env } from './env.js';

let adminClient: SupabaseClient | null = null;

/**
 * Returns the service-role Supabase client. It is created lazily so the API can
 * start and run tests without credentials; any code path that needs the database
 * fails with a clear configuration error instead.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError(
      500,
      'SUPABASE_NOT_CONFIGURED',
      'The server is missing its Supabase credentials.'
    );
  }

  if (!adminClient) {
    adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
