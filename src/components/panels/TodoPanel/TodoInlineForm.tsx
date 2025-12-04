import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { api, ApiValidationError } from '../../../lib/api';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../../../lib/api';

interface TodoInlineFormProps {
  todo?: Todo | null;
  onSave: () => void;
  onCancel: () => void;
}

export function TodoInlineForm({ todo, onSave, onCancel }: TodoInlineFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    note: '',
    due_time: '',
    is_whole_day: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        note: todo.note || '',
        due_time: todo.due_time
          ? todo.is_whole_day
            ? todo.due_time.slice(0, 10)
            : todo.due_time.slice(0, 16)
          : '',
        is_whole_day: todo.is_whole_day,
      });
    } else {
      setFormData({ title: '', note: '', due_time: '', is_whole_day: false });
    }
    setErrors({});
  }, [todo]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    let dueTime = formData.due_time || null;
    if (dueTime && formData.is_whole_day) {
      dueTime = `${dueTime}T00:00:00`;
    }

    try {
      setSaving(true);
      setErrors({});

      if (todo) {
        const updateData: UpdateTodoInput = {
          title: formData.title.trim(),
          note: formData.note.trim() || null,
          due_time: dueTime,
          is_whole_day: formData.is_whole_day,
        };
        await api.todos.update(todo.id, updateData);
      } else {
        const createData: CreateTodoInput = {
          title: formData.title.trim(),
          note: formData.note.trim() || null,
          due_time: dueTime,
          is_whole_day: formData.is_whole_day,
        };
        await api.todos.create(createData);
      }
      onSave();
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="card card-compact bg-base-300">
      <div className="card-body">
        {errors.general && (
          <div className="alert alert-error alert-sm py-1">
            <span className="text-xs">{errors.general}</span>
          </div>
        )}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onKeyDown={handleKeyDown}
            className={`input input-sm input-bordered w-full ${errors.title ? 'input-error' : ''}`}
            autoFocus
          />
          {errors.title && <p className="text-error text-xs">{errors.title}</p>}

          <textarea
            placeholder="Add a note... (optional)"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="textarea textarea-bordered textarea-sm w-full resize-none"
            rows={2}
          />

          <div className="flex items-center gap-2">
            <input
              type={formData.is_whole_day ? 'date' : 'datetime-local'}
              value={formData.due_time}
              onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
              className="input input-sm input-bordered flex-1"
            />
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_whole_day}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_whole_day: e.target.checked,
                    due_time:
                      e.target.checked && formData.due_time
                        ? formData.due_time.slice(0, 10)
                        : formData.due_time,
                  })
                }
                className="checkbox checkbox-xs"
              />
              <span className="text-xs whitespace-nowrap">All day</span>
            </label>
          </div>

          <div className="flex justify-end gap-1 pt-1">
            <button className="btn btn-ghost btn-xs" onClick={onCancel} disabled={saving}>
              <X className="h-3 w-3" />
              Cancel
            </button>
            <button className="btn btn-primary btn-xs" onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Check className="h-3 w-3" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
