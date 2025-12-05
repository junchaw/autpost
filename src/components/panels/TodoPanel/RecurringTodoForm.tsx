import type { IntervalUnit } from '../../../lib/api';
import {
  type FormErrors,
  INTERVAL_UNIT_LABELS,
  type RecurringTodoFormData,
} from './recurring-todo-utils';

interface RecurringTodoFormProps {
  formData: RecurringTodoFormData;
  setFormData: (data: RecurringTodoFormData) => void;
  errors: FormErrors;
  clearFieldError: (field: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  saveLabel?: string;
}

export function RecurringTodoForm({
  formData,
  setFormData,
  errors,
  clearFieldError,
  onSave,
  onCancel,
  saving,
  saveLabel = 'Save',
}: RecurringTodoFormProps) {
  return (
    <div className="card card-compact bg-base-300">
      <div className="card-body space-y-3">
        {errors.general && (
          <div className="alert alert-error alert-sm">
            <span className="text-sm">{errors.general}</span>
          </div>
        )}
        <div>
          <input
            type="text"
            placeholder="Title..."
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              clearFieldError('title');
            }}
            className={`input input-sm input-bordered w-full ${errors.title ? 'input-error' : ''}`}
            autoFocus
          />
          {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
        </div>
        <textarea
          placeholder="Note (optional)..."
          value={formData.note}
          onChange={(e) => {
            setFormData({ ...formData, note: e.target.value });
            clearFieldError('note');
          }}
          className={`textarea textarea-bordered textarea-sm w-full resize-none ${errors.note ? 'textarea-error' : ''}`}
          rows={2}
        />
        {errors.note && <p className="text-error text-xs mt-1">{errors.note}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label py-1">
              <span className="label-text text-xs">Interval</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={formData.interval}
                onChange={(e) => {
                  setFormData({ ...formData, interval: parseInt(e.target.value) || 1 });
                  clearFieldError('interval');
                }}
                className={`input input-sm input-bordered w-20 ${errors.interval ? 'input-error' : ''}`}
              />
              <select
                value={formData.interval_unit}
                onChange={(e) => {
                  setFormData({ ...formData, interval_unit: e.target.value as IntervalUnit });
                  clearFieldError('interval_unit');
                }}
                className={`select select-sm select-bordered flex-1 ${errors.interval_unit ? 'select-error' : ''}`}
              >
                {Object.entries(INTERVAL_UNIT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {errors.interval && <p className="text-error text-xs mt-1">{errors.interval}</p>}
            {errors.interval_unit && (
              <p className="text-error text-xs mt-1">{errors.interval_unit}</p>
            )}
          </div>
          <div>
            <label className="label py-1">
              <span className="label-text text-xs">Start Time</span>
            </label>
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => {
                setFormData({ ...formData, start_time: e.target.value });
                clearFieldError('start_time');
              }}
              className={`input input-sm input-bordered w-full ${errors.start_time ? 'input-error' : ''}`}
            />
            {errors.start_time && <p className="text-error text-xs mt-1">{errors.start_time}</p>}
          </div>
        </div>
        <div>
          <label className="label py-1">
            <span className="label-text text-xs">End Time (optional)</span>
          </label>
          <input
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => {
              setFormData({ ...formData, end_time: e.target.value });
              clearFieldError('end_time');
            }}
            className={`input input-sm input-bordered w-full ${errors.end_time ? 'input-error' : ''}`}
          />
          {errors.end_time && <p className="text-error text-xs mt-1">{errors.end_time}</p>}
        </div>
        <div className="flex gap-2 justify-end">
          <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={onSave} disabled={saving}>
            {saving && <span className="loading loading-spinner loading-xs"></span>}
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
