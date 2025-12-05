import { type ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, children, className = '' }: FormFieldProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-sm mb-1">{label}</span>
      {children}
      {error && <span className="text-error text-sm mt-1">{error}</span>}
    </div>
  );
}

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'url';
  className?: string;
}

export function FormInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  className = '',
}: FormInputProps) {
  return (
    <FormField label={label} error={error} className={className}>
      <input
        type={type}
        className={`input input-bordered ${error ? 'input-error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </FormField>
  );
}

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
  className?: string;
}

export function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  error,
  rows = 3,
  className = '',
}: FormTextareaProps) {
  return (
    <FormField label={label} error={error} className={className}>
      <textarea
        className={`textarea textarea-bordered ${error ? 'textarea-error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </FormField>
  );
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  className?: string;
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  error,
  className = '',
}: FormSelectProps) {
  return (
    <FormField label={label} error={error} className={className}>
      <select
        className={`select select-bordered ${error ? 'select-error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
