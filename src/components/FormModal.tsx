import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { X, Save } from 'lucide-react';
import { ApiValidationError } from '../lib/api';

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: T) => Promise<void>;
  title: string;
  children: (props: {
    errors: FormErrors;
    setFieldError: (field: string, error: string | undefined) => void;
    clearFieldError: (field: string) => void;
  }) => ReactNode;
  validate?: () => FormErrors | null;
  getFormData: () => T;
}

export function FormModal<T>({
  isOpen,
  onClose,
  onSave,
  title,
  children,
  validate,
  getFormData,
}: FormModalProps<T>) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Handle native dialog close (e.g., Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      setErrors({});
      onClose();
    };

    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const setFieldError = useCallback((field: string, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSave = async () => {
    // Run client-side validation if provided
    if (validate) {
      const validationErrors = validate();
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    try {
      setSaving(true);
      setErrors({});
      await onSave(getFormData());
      onClose();
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setErrors(err.getFieldErrors());
      } else {
        setErrors({ general: err instanceof Error ? err.message : 'Failed to save' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        {errors.general && (
          <div className="alert alert-error alert-sm mb-3">
            <span className="text-sm">{errors.general}</span>
          </div>
        )}
        <div className="space-y-4">{children({ errors, setFieldError, clearFieldError })}</div>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={handleClose} disabled={saving}>
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

// Reusable form field components
interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'date' | 'datetime-local';
  autoFocus?: boolean;
  className?: string;
  min?: string | number;
}

export function FormInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
  autoFocus,
  className = '',
  min,
}: FormInputProps) {
  return (
    <div className={className}>
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
        autoFocus={autoFocus}
        min={min}
      />
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
}

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function FormTextarea({
  label,
  value,
  onChange,
  error,
  placeholder,
  rows = 3,
  className = '',
}: FormTextareaProps) {
  return (
    <div className={className}>
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`textarea textarea-bordered w-full resize-none ${error ? 'textarea-error' : ''}`}
        rows={rows}
      />
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
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
    <div className={className}>
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`select select-bordered w-full ${error ? 'select-error' : ''}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-error text-sm mt-1">{error}</p>}
    </div>
  );
}

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function FormCheckbox({ label, checked, onChange, className = '' }: FormCheckboxProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox checkbox-sm"
      />
      <span className="text-sm whitespace-nowrap">{label}</span>
    </label>
  );
}
