import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@housing/shared';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { ApiError, apiFetch } from '../../lib/api';
import { supabase } from '../../lib/supabase';

const levels = [100, 200, 300, 400, 500, 600];

export function RegisterPage() {
  const navigate = useNavigate();
  const { session, user, loading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

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

    try {
      await apiFetch<unknown>('/auth/register', { method: 'POST', body: values });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error || !data.session) {
        setServerError('Account created, but sign-in failed. Please sign in manually.');
        navigate('/login', { replace: true });
        return;
      }

      navigate('/student', { replace: true });
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.fields) {
        for (const [field, message] of Object.entries(submitError.fields)) {
          setError(field as keyof RegisterInput, { message });
        }
      }
      setServerError(
        submitError instanceof Error ? submitError.message : 'Could not create your account.'
      );
    }
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-wide text-ink-500">University of Ibadan</p>
        <h1 className="mt-1 text-display font-semibold text-ink-900">Student registration</h1>
        <p className="mt-1 text-sm text-ink-600">Create an account to apply for accommodation.</p>
      </div>

      <form
        className="space-y-4 rounded-lg border border-ink-200 bg-surface p-6 shadow-sm"
        onSubmit={onSubmit}
        noValidate
      >
        <FormError message={serverError} />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            autoComplete="given-name"
            error={errors.first_name?.message}
            {...register('first_name')}
          />
          <TextField
            label="Last name"
            autoComplete="family-name"
            error={errors.last_name?.message}
            {...register('last_name')}
          />
        </div>

        <TextField
          label="Matriculation number"
          error={errors.matric_no?.message}
          {...register('matric_no')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Faculty" error={errors.faculty?.message} {...register('faculty')} />
          <TextField
            label="Department"
            error={errors.department?.message}
            {...register('department')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Level"
            error={errors.level?.message}
            {...register('level', { valueAsNumber: true })}
          >
            <option value="">Select level</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </SelectField>
          <SelectField label="Gender" error={errors.gender?.message} {...register('gender')}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </SelectField>
          <TextField
            label="Phone (optional)"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-600">
        Already registered?{' '}
        <Link className="font-medium underline" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
