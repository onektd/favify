'use client';

import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { Check, Copy, LoaderCircle } from 'lucide-react';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'xs' | 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-fg hover:bg-primary-hover shadow-[var(--shadow),inset_0_1px_0_rgb(255_255_255/0.12)]',
  secondary: 'bg-surface text-fg border border-border shadow-card hover:bg-surface-2',
  outline: 'bg-surface text-fg border border-border hover:bg-surface-2',
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  danger: 'bg-danger text-white hover:opacity-90 shadow-card',
};

const sizes: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-[12.5px] gap-1.5 rounded-md [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0',
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0',
  md: 'h-9 px-3.5 text-[13px] gap-2 rounded-lg [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
  lg: 'h-10 px-4 text-sm gap-2 rounded-lg [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading, icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('rounded-xl border border-border bg-surface shadow-card', className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex h-12 items-center justify-between gap-3 border-b border-border px-4">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="text-muted shrink-0">{icon}</span>}
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-semibold tracking-tight text-fg truncate">{title}</h2>
          {description && <p className="text-[12px] text-muted truncate">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  fullWidth = false,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: ReactNode }>;
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        fullWidth ? 'flex w-full items-center' : 'inline-flex items-center',
        'h-8 rounded-lg bg-surface-2 p-1 gap-1 border border-border/80',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex h-full items-center justify-center rounded text-[12.5px] font-medium transition-[color,background-color,box-shadow] cursor-pointer select-none whitespace-nowrap',
              fullWidth ? 'flex-1 min-w-0 px-2' : 'px-2.5',
              active
                ? 'bg-surface text-fg shadow-card'
                : 'text-muted hover:text-fg',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors',
        checked ? 'bg-primary' : 'bg-surface-3',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

export interface NumericEditConfig {
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}

export interface ColorEditConfig {
  value: string;
  onChange: (hex: string) => void;
}

export function InlineEditableValue({
  display,
  numericEdit,
  colorEdit,
}: {
  display: string;
  numericEdit?: NumericEditConfig;
  colorEdit?: ColorEditConfig;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  if (!numericEdit && !colorEdit) {
    return <span className="font-mono tabular-nums text-[11.5px] text-muted">{display}</span>;
  }

  const startEdit = () => {
    if (numericEdit) {
      setDraft(String(numericEdit.value));
    } else if (colorEdit) {
      setDraft(colorEdit.value.toUpperCase());
    }
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    if (numericEdit) {
      const parsed = parseFloat(draft);
      if (!Number.isNaN(parsed)) {
        const clamped = Math.max(numericEdit.min, Math.min(numericEdit.max, parsed));
        numericEdit.onChange(clamped);
      }
    } else if (colorEdit) {
      const trimmed = draft.trim();
      const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
      if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
        colorEdit.onChange(normalized.toLowerCase());
      }
    }
  };

  if (editing) {
    return (
      <input
        type={numericEdit ? 'number' : 'text'}
        autoFocus
        value={draft}
        min={numericEdit?.min}
        max={numericEdit?.max}
        step={numericEdit?.step ?? 'any'}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            setEditing(false);
          }
        }}
        className="h-5 w-16 rounded border border-primary bg-surface px-1 text-right font-mono tabular-nums text-[11.5px] text-fg focus:outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      title="Click to type a value"
      className="rounded px-1 py-0.5 -mr-1 font-mono tabular-nums text-[11.5px] text-muted hover:bg-surface-2 hover:text-fg transition-colors cursor-text"
    >
      {display}
    </button>
  );
}

export function Field({
  label,
  hint,
  valueDisplay,
  numericEdit,
  colorEdit,
  children,
}: {
  label: string;
  hint?: string;
  valueDisplay?: string;
  numericEdit?: NumericEditConfig;
  colorEdit?: ColorEditConfig;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[12.5px] font-medium text-fg">{label}</label>
        {valueDisplay && (
          <InlineEditableValue
            display={valueDisplay}
            numericEdit={numericEdit}
            colorEdit={colorEdit}
          />
        )}
      </div>
      {children}
      {hint && <p className="text-[11.5px] text-muted">{hint}</p>}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-9 w-full rounded-lg border border-border bg-surface px-3 text-[13px] text-fg placeholder:text-faint shadow-[inset_0_1px_1px_rgb(16_16_24/0.02)] transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50',
          className,
        )}
        {...rest}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'select-chevron h-9 w-full rounded-lg border border-border bg-surface pl-3 pr-8 text-[13px] text-fg transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    );
  },
);

export function RangeSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  ariaLabel?: string;
}) {
  return (
    <input
      type="range"
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="h-5 w-full cursor-pointer accent-primary select-none"
    />
  );
}

export function CopyButton({
  text,
  label = 'Copy',
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <Button
      size="xs"
      variant="secondary"
      onClick={handleCopy}
      icon={copied ? <Check className="text-success" /> : <Copy />}
    >
      {copied ? 'Copied' : label}
    </Button>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'success';
}) {
  const styles = {
    neutral: 'bg-surface-2 text-muted border-border',
    primary: 'bg-primary-soft text-primary-text border-primary/20',
    success: 'bg-success-soft text-success border-success/20',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium',
        styles[tone],
      )}
    >
      {children}
    </span>
  );
}
