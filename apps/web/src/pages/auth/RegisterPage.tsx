import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@housing/shared';
import { useEffect, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/Button';
import { FormError } from '../../components/FormError';
import { PasswordField } from '../../components/PasswordField';
import { SelectField } from '../../components/SelectField';
import { TextField } from '../../components/TextField';
import { useToast } from '../../components/Toast';
import { ApiError, apiFetch } from '../../lib/api';
import { errorInfo } from '../../lib/errors';
import { supabase } from '../../lib/supabase';

const levels = [100, 200, 300, 400, 500, 600];

const steps = [
  { title: 'Personal', description: 'Your name and contact details' },
  { title: 'Academic', description: 'Your current study details' },
  { title: 'Account', description: 'Sign-in details and review' },
] as const;

const stepFields: (keyof RegisterInput)[][] = [
  ['first_name', 'last_name', 'matric_no', 'gender', 'phone'],
  ['faculty', 'department', 'level'],
  ['email', 'password'],
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { session, user, loading } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverErrorCode, setServerErrorCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const values = watch();

  useEffect(() => {
    if (!loading && session && user) {
      navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true });
    }
  }, [loading, session, user, navigate]);

  const nextStep = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) {
      setStep((current) => Math.min(current + 1, steps.length - 1));
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    setServerErrorCode(null);

    if (!supabase) {
      setServerError('The registration service is not configured. Contact the administrator.');
      return;
    }

    try {
      await apiFetch<unknown>('/auth/register', { method: 'POST', body: data });

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error || !authData.session) {
        setServerError(
          'Your account was created, but we could not sign you in. Sign in manually to continue.'
        );
        navigate('/login', { replace: true });
        return;
      }

      toast({
        title: 'Account created',
        description: 'Welcome to the housing portal.',
        variant: 'success',
      });
      navigate('/student', { replace: true });
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.fields) {
        for (const [field, message] of Object.entries(submitError.fields)) {
          setError(field as keyof RegisterInput, { message });
        }
      }
      const info = errorInfo(submitError, 'We could not create your account. Please try again.');
      setServerError(info.message);
      setServerErrorCode(info.code ?? null);
    }
  });

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (step < steps.length - 1) {
      event.preventDefault();
      void nextStep();
      return;
    }
    void onSubmit(event);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-wide text-ink-500">University of Ibadan</p>
        <h1 className="mt-1 text-display font-semibold text-ink-900">Student registration</h1>
        <p className="mt-1 text-sm text-ink-600">Create an account in three short steps.</p>
      </div>

      <div className="mb-5 rounded-lg border border-ink-200 bg-surface p-4 shadow-sm">
        <ol className="grid grid-cols-3 gap-2">
          {steps.map((item, index) => {
            const state = index < step ? 'complete' : index === step ? 'current' : 'upcoming';

            return (
              <li key={item.title} className="text-center">
                <div
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                    state === 'complete'
                      ? 'border-success bg-success-light text-success-dark'
                      : state === 'current'
                        ? 'border-primary bg-primary text-white'
                        : 'border-ink-300 bg-surface text-ink-500'
                  }`}
                  aria-current={state === 'current' ? 'step' : undefined}
                >
                  {index + 1}
                </div>
                <p
                  className={`mt-1 text-xs font-medium ${
                    state === 'current' ? 'text-ink-900' : 'text-ink-500'
                  }`}
                >
                  {item.title}
                </p>
                <p className="hidden text-xs text-ink-500 sm:block">{item.description}</p>
              </li>
            );
          })}
        </ol>
      </div>

      <form
        className="space-y-5 rounded-lg border border-ink-200 bg-surface p-6 shadow-sm"
        onSubmit={handleFormSubmit}
        noValidate
      >
        <FormError message={serverError} code={serverErrorCode ?? undefined} />

        <div className={step === 0 ? 'space-y-4' : 'hidden'}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="First name"
              autoComplete="given-name"
              requirement="required"
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <TextField
              label="Last name"
              autoComplete="family-name"
              requirement="required"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>

          <TextField
            label="Matriculation number"
            requirement="required"
            hint="Use the format issued by the university, for example UI/2023/1042."
            error={errors.matric_no?.message}
            {...register('matric_no')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Gender"
              requirement="required"
              error={errors.gender?.message}
              {...register('gender')}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </SelectField>
            <TextField
              label="Phone"
              autoComplete="tel"
              requirement="optional"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
        </div>

        <div className={step === 1 ? 'space-y-4' : 'hidden'}>
          <TextField
            label="Faculty"
            requirement="required"
            error={errors.faculty?.message}
            {...register('faculty')}
          />
          <TextField
            label="Department"
            requirement="required"
            error={errors.department?.message}
            {...register('department')}
          />
          <SelectField
            label="Level"
            requirement="required"
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
        </div>

        <div className={step === 2 ? 'space-y-4' : 'hidden'}>
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
            autoComplete="new-password"
            requirement="required"
            hint="Use at least 8 characters."
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="rounded-md border border-ink-200 bg-surface-1 p-4 text-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Review</h2>
            <dl className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-500">Name</dt>
                <dd className="text-ink-800">
                  {values.first_name || '—'} {values.last_name || ''}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-500">
                  Matriculation number
                </dt>
                <dd className="text-ink-800">{values.matric_no || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-500">Faculty</dt>
                <dd className="text-ink-800">{values.faculty || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-500">Department</dt>
                <dd className="text-ink-800">{values.department || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-500">Level</dt>
                <dd className="text-ink-800">{values.level || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-500">Email</dt>
                <dd className="break-all text-ink-800">{values.email || '—'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            disabled={step === 0}
          >
            Back
          </Button>

          {step < steps.length - 1 ? (
            <Button type="button" onClick={() => void nextStep()}>
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              loading={isSubmitting}
              loadingLabel="Creating account..."
              disabled={!isValid}
            >
              {isValid ? 'Create account' : 'Complete all required fields'}
            </Button>
          )}
        </div>
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
