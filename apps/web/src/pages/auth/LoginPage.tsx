import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@housing/shared';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { PasswordField } from '../../components/PasswordField';
import { TextField } from '../../components/TextField';
import { apiFetch } from '../../lib/api';
import { errorInfo } from '../../lib/errors';
import { supabase } from '../../lib/supabase';
import type { MyAccount } from '../../lib/types';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, user, loading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverErrorCode, setServerErrorCode] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!loading && session && user) {
      navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true });
    }
  }, [loading, session, user, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setServerErrorCode(null);

    if (!supabase) {
      setServerError('The sign-in service is not configured. Contact the administrator.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error || !data.session) {
      setServerError('Email or password is incorrect. Check your details and try again.');
      return;
    }

    try {
      const account = await apiFetch<MyAccount>('/me', {
        token: data.session.access_token,
      });
      navigate(account.user.role === 'admin' ? '/admin' : '/student', { replace: true });
    } catch (loadError) {
      const info = errorInfo(loadError, 'We could not load your account. Please try again.');
      setServerError(info.message);
      setServerErrorCode(info.code ?? null);
    }
  });

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-5xl items-center gap-8 px-4 py-10 md:grid-cols-2">
      <section className="hidden rounded-xl bg-primary p-10 text-white md:block">
        <p className="text-xs uppercase tracking-[0.2em] text-primary-100">University of Ibadan</p>
        <h1 className="mt-3 text-display font-semibold">Housing Allocation</h1>
        <p className="mt-4 max-w-sm text-sm text-primary-100">
          Apply for accommodation, track your application, and view your room allocation in one
          place.
        </p>
        <ul className="mt-8 space-y-3 text-sm">
          {[
            'Apply in three simple steps',
            'Track your application status',
            'Receive your room allocation',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="w-full">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-ink-500 md:hidden">
            University of Ibadan
          </p>
          <h1 className="mt-1 text-display font-semibold text-ink-900 md:hidden">
            Housing Allocation
          </h1>
          <p className="mt-2 text-sm text-ink-600">Sign in to continue.</p>
        </div>

        <form
          className="space-y-4 rounded-lg border border-ink-200 bg-surface p-6 shadow-sm"
          onSubmit={onSubmit}
          noValidate
        >
          <FormError message={serverError} code={serverErrorCode ?? undefined} />
          <TextField
            label="Email address"
            type="email"
            autoComplete="email"
            requirement="required"
            error={errors.email?.message}
            {...register('email')}
          />
          <PasswordField
            label="Password"
            autoComplete="current-password"
            requirement="required"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button
            className="w-full"
            type="submit"
            loading={isSubmitting}
            loadingLabel="Signing in..."
            disabled={!isValid}
          >
            {isValid ? 'Sign in' : 'Enter your details'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-600">
          New student?{' '}
          <Link className="font-medium underline" to="/register">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}
