import { ApiValidationError } from '../../../lib/api';
import type { IntervalUnit } from '../../../lib/api';

export interface RecurringTodoFormData {
  title: string;
  note: string;
  interval: number;
  interval_unit: IntervalUnit;
  start_time: string;
  end_time: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export const INTERVAL_UNIT_LABELS: Record<IntervalUnit, string> = {
  second: 'Second(s)',
  minute: 'Minute(s)',
  hour: 'Hour(s)',
  day: 'Day(s)',
  week: 'Week(s)',
  month: 'Month(s)',
  year: 'Year(s)',
};

export function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getDefaultFormData(): RecurringTodoFormData {
  return {
    title: '',
    note: '',
    interval: 1,
    interval_unit: 'day',
    start_time: toDateTimeLocal(new Date()),
    end_time: '',
  };
}

export function validateForm(formData: RecurringTodoFormData): FormErrors | null {
  const errors: FormErrors = {};

  if (!formData.title.trim()) {
    errors.title = 'Title is required';
  }

  if (formData.interval < 1) {
    errors.interval = 'Interval must be at least 1';
  }

  if (!formData.start_time) {
    errors.start_time = 'Start time is required';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function parseApiError(err: unknown): FormErrors {
  if (err instanceof ApiValidationError) {
    return err.getFieldErrors();
  }
  return { general: err instanceof Error ? err.message : 'An error occurred' };
}
