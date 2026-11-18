import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

type Requirement = 'required' | 'optional' | 'none';

interface SelectFieldProps extends Omit<ComponentPropsWithRef<'select'>, 'children' | 'ref'> {
  label: string;
  error?: string;
  hint?: string;
  requirement?: Requirement;
  children: ReactNode;
}

interface OptionItem {
  value: string;
  label: string;
  disabled: boolean;
}

function parseOptions(children: ReactNode): OptionItem[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) {
      return [];
    }

    const props = child.props as {
      value?: string | number;
      disabled?: boolean;
      children?: ReactNode;
    };
    const value = props.value === undefined ? '' : String(props.value);

    return [
      {
        value,
        label: String(props.children ?? value),
        disabled: Boolean(props.disabled),
      },
    ];
  });
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  {
    label,
    error,
    hint,
    requirement = 'none',
    id,
    name,
    children,
    disabled = false,
    value,
    defaultValue,
    onChange,
    onBlur,
    className = '',
    ...rest
  },
  forwardedRef
) {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const options = parseOptions(children);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const initialValue =
    typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : typeof defaultValue === 'string' || typeof defaultValue === 'number'
        ? String(defaultValue)
        : '';
  const [current, setCurrent] = useState(initialValue);

  const selectedIndex = options.findIndex((option) => option.value === current);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const emptyOption = options.find((option) => option.value === '');
  const display = selectedOption?.label ?? emptyOption?.label ?? 'Select an option';

  const setRefs = (node: HTMLSelectElement | null) => {
    selectRef.current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  useEffect(() => {
    const node = selectRef.current;
    if (!node) {
      return;
    }
    if (node.value !== current) {
      setCurrent(node.value);
    }
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const firstEnabled = (): number => options.findIndex((option) => !option.disabled);

  const moveActive = (start: number, step: number): number => {
    if (options.length === 0) {
      return -1;
    }
    let index = start;
    for (let count = 0; count < options.length; count += 1) {
      index = (index + step + options.length) % options.length;
      const option = options[index];
      if (option && !option.disabled) {
        return index;
      }
    }
    return start;
  };

  const openList = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabled());
    setOpen(true);
  };

  const choose = (option: OptionItem) => {
    if (option.disabled) {
      return;
    }

    setOpen(false);
    setCurrent(option.value);

    const node = selectRef.current;
    if (node) {
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
      setter?.call(node, option.value);
    }

    // Notify React Hook Form and controlled callers directly. Relying on a
    // dispatched native change event is unreliable for a hidden select.
    onChange?.({
      target: { name, value: option.value, type: 'select-one' },
      currentTarget: node,
    } as unknown as ChangeEvent<HTMLSelectElement>);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          setActiveIndex((index) => moveActive(index, 1));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          setActiveIndex((index) => moveActive(index, -1));
        }
        break;
      case 'Home':
        if (open) {
          event.preventDefault();
          setActiveIndex(firstEnabled());
        }
        break;
      case 'End':
        if (open) {
          event.preventDefault();
          setActiveIndex(moveActive(-1, -1));
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) {
          const option = options[activeIndex];
          if (option) {
            choose(option);
          }
        } else {
          openList();
        }
        break;
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="flex items-center gap-1 text-sm font-medium text-ink-700" htmlFor={inputId}>
        <span>{label}</span>
        {requirement === 'required' ? (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
        {requirement === 'optional' ? (
          <span className="text-xs font-normal text-ink-500">(optional)</span>
        ) : null}
      </label>

      <div className="relative">
        <button
          type="button"
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-invalid={Boolean(error)}
          aria-required={requirement === 'required'}
          aria-describedby={hint ? `${inputId}-hint` : undefined}
          disabled={disabled}
          className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-md border bg-surface px-3 py-2 text-left text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400 ${
            error ? 'border-danger' : 'border-ink-300'
          } ${className}`}
          onClick={() => {
            if (open) {
              setOpen(false);
            } else {
              openList();
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={(event) => {
            setOpen(false);
            onBlur?.(event as unknown as FocusEvent<HTMLSelectElement>);
          }}
        >
          <span className={selectedOption || emptyOption ? 'text-ink-900' : 'text-ink-400'}>
            {display}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className={`h-4 w-4 text-ink-400 transition ${open ? 'rotate-180' : ''}`}
            fill="currentColor"
          >
            <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
          </svg>
        </button>

        {open ? (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-auto rounded-md border border-ink-200 bg-surface py-1 shadow-lg"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-ink-500">No options available</li>
            ) : null}
            {options.map((option, index) => {
              const isSelected = option.value === current;
              const isActive = index === activeIndex;

              return (
                <li
                  key={`${option.value}-${index}`}
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    isSelected
                      ? 'bg-primary-50 font-medium text-primary-800'
                      : isActive
                        ? 'bg-ink-50 text-ink-900'
                        : 'text-ink-700'
                  } ${option.disabled ? 'cursor-not-allowed text-ink-400' : ''}`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(option);
                  }}
                  onMouseEnter={() => {
                    if (!option.disabled) {
                      setActiveIndex(index);
                    }
                  }}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <select
        ref={setRefs}
        id={`${inputId}-native`}
        name={name}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        {...rest}
      >
        {children}
      </select>

      {hint ? (
        <p className="text-xs text-ink-500" id={`${inputId}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
