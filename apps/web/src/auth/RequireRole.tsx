import type { UserRole } from '@housing/shared';
import type { ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface RequireRoleProps {
  role: UserRole;
  children: ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { loading, session, user } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading your account...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-slate-700">We could not load your account.</p>
        <Link className="mt-3 inline-block underline" to="/login">
          Sign in again
        </Link>
      </div>
    );
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return <>{children}</>;
}
