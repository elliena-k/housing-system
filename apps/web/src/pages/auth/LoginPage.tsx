import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@housing/shared';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { TextField } from '../../components/TextField';
import { apiFetch } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import type { MyAccount } from '../../lib/types';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, user, loading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (!loading && session && user) {
      navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true });
    }
  }, [loading, session, user, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    if (!supabase) {
      setServerError('Supabase is not configured. Add the frontend environment variables.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error || !data.session) {
      setServerError(error?.message ?? 'Could not sign in. Check your details and try again.');
      return;
    }

    try {
      const account = await apiFetch<MyAccount>('/me', {
        token: data.session.access_token,
      });
      navigate(account.user.role === 'admin' ? '/admin' : '/student', { replace: true });
    } catch (loadError) {
      setServerError(
        loadError instanceof Error ? loadError.message : 'Could not load your account.'
      );
    }
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-wide text-ink-500">University of Ibadan</p>
        <h1 className="mt-1 text-display font-semibold text-ink-900">Housing Allocation</h1>
        <p className="mt-1 text-sm text-ink-600">Sign in to continue.</p>
      </div>

      <form
        className="space-y-4 rounded-lg border border-ink-200 bg-surface p-6 shadow-sm"
        onSubmit={onSubmit}
        noValidate
      >
        <FormError message={serverError} />
        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-600">
        New student?{' '}
        <Link className="font-medium underline" to="/register">
          Create an account
        </Link>
      </p>
    </div>
  );
}
