import type { UserRole } from '@housing/shared';
import { useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from './AuthProvider';

interface RequireRoleProps {
  role: UserRole;
  children: ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { loading, session, user, error, refresh } = useAuth();
  const [retrying, setRetrying] = useState(false);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading your account..." />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md p-8">
        <ErrorState
          message={error ?? 'We could not load your account. Please try again.'}
          onRetry={() => {
            setRetrying(true);
            void refresh().finally(() => setRetrying(false));
          }}
          retrying={retrying}
        />
      </div>
    );
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return <>{children}</>;
}
