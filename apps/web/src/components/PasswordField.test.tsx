// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { PasswordField } from './PasswordField';

interface FormValues {
  password: string;
}

function PasswordForm({ onSubmit }: { onSubmit: (values: FormValues) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({ mode: 'onChange' });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PasswordField
        label="Password"
        requirement="required"
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required.',
          minLength: { value: 8, message: 'Use at least 8 characters.' },
        })}
      />
      <button type="submit" disabled={!isValid}>
        Submit
      </button>
    </form>
  );
}

describe('PasswordField', () => {
  it('registers with react-hook-form and preserves the value when toggled', async () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const onSubmit = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<PasswordForm onSubmit={onSubmit} />);
    });

    const input = container.querySelector('input[name="password"]') as HTMLInputElement;
    const toggle = container.querySelector('button') as HTMLButtonElement;
    const submit = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(input.type).toBe('password');
    expect(submit.disabled).toBe(true);

    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    await act(async () => {
      valueSetter?.call(input, 'secret123');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(submit.disabled).toBe(false);

    await act(async () => {
      toggle.click();
    });

    expect(input.type).toBe('text');
    expect(input.value).toBe('secret123');
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');

    await act(async () => {
      toggle.click();
    });

    expect(input.type).toBe('password');
    expect(input.value).toBe('secret123');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');

    await act(async () => {
      submit.click();
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'secret123' }),
      expect.anything()
    );

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
