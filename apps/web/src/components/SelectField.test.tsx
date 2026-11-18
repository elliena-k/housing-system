// @vitest-environment jsdom
import { zodResolver } from '@hookform/resolvers/zod';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { SelectField } from './SelectField';
import { TextField } from './TextField';

const schema = z.object({
  name: z.string().min(1, 'Name is required.'),
  level: z.coerce.number().pipe(z.union([z.literal(100), z.literal(200)])),
  gender: z.enum(['male', 'female']),
});

type FormValues = z.infer<typeof schema>;

function TestForm({ onSubmit }: { onSubmit: (values: FormValues) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onChange' });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Name"
        requirement="required"
        error={errors.name?.message}
        {...register('name')}
      />
      <SelectField
        label="Level"
        requirement="required"
        error={errors.level?.message}
        {...register('level', { valueAsNumber: true })}
      >
        <option value="">Select level</option>
        <option value="100">100</option>
        <option value="200">200</option>
      </SelectField>
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
      <button type="submit" disabled={!isValid}>
        Submit
      </button>
      <span data-testid="valid">{String(isValid)}</span>
    </form>
  );
}

async function chooseOption(container: HTMLElement, triggerId: string, label: string) {
  const trigger = container.querySelector(`#${triggerId}`) as HTMLButtonElement | null;
  expect(trigger).not.toBeNull();

  await act(async () => {
    trigger?.click();
  });

  const option = Array.from(container.querySelectorAll('[role="option"]')).find(
    (element) => element.textContent === label
  );
  expect(option).toBeDefined();

  await act(async () => {
    option?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  });
}

describe('SelectField with react-hook-form', () => {
  it('registers the selected values and becomes valid', async () => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    const onSubmit = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TestForm onSubmit={onSubmit} />);
    });

    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    await act(async () => {
      valueSetter?.call(nameInput, 'Ada');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await chooseOption(container, 'level', '100');
    expect(container.querySelector('#level')?.textContent).toContain('100');

    await chooseOption(container, 'gender', 'Female');
    expect(container.querySelector('#gender')?.textContent).toContain('Female');

    const submit = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submit.disabled).toBe(false);

    await act(async () => {
      submit.click();
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ada', level: 100, gender: 'female' }),
      expect.anything()
    );

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
