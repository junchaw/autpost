import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, Pause, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../../lib/api';
import type {
  RecurringTodo,
  IntervalUnit,
  CreateRecurringTodoInput,
  UpdateRecurringTodoInput,
  Pagination,
} from '../../../lib/api';
import { RecurringTodoForm } from './RecurringTodoForm';
import {
  type RecurringTodoFormData,
  type FormErrors,
  INTERVAL_UNIT_LABELS,
  toDateTimeLocal,
  getDefaultFormData,
  validateForm,
  parseApiError,
} from './recurring-todo-utils';

interface RecurringTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTodosGenerated?: () => void;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString();
}

const PER_PAGE = 10;

export function RecurringTodoModal({ isOpen, onClose, onTodosGenerated }: RecurringTodoModalProps) {
  const [recurringTodos, setRecurringTodos] = useState<RecurringTodo[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<RecurringTodoFormData>(getDefaultFormData());

  const loadRecurringTodos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.recurringTodos.list({
        page: currentPage,
        perPage: PER_PAGE,
      });
      setRecurringTodos(response.recurring_todos);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recurring todos');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Dialog open/close effect
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      loadRecurringTodos();
    } else {
      dialog.close();
    }
  }, [isOpen, loadRecurringTodos]);

  // Handle native dialog close (e.g., Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  // Reload when page changes
  useEffect(() => {
    if (isOpen) {
      loadRecurringTodos();
    }
  }, [currentPage, isOpen, loadRecurringTodos]);

  const resetForm = () => {
    setFormData(getDefaultFormData());
    setFormErrors({});
  };

  const clearFieldError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  const handleAdd = async () => {
    const validationErrors = validateForm(formData);
    if (validationErrors) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);
      const data: CreateRecurringTodoInput = {
        title: formData.title.trim(),
        note: formData.note.trim() || null,
        interval: formData.interval,
        interval_unit: formData.interval_unit,
        start_time: formData.start_time,
        end_time: formData.end_time || null,
      };
      await api.recurringTodos.create(data);
      resetForm();
      setIsAdding(false);
      loadRecurringTodos();
      onTodosGenerated?.();
    } catch (err) {
      setFormErrors(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    const validationErrors = validateForm(formData);
    if (validationErrors) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);
      const data: UpdateRecurringTodoInput = {
        title: formData.title.trim(),
        note: formData.note.trim() || null,
        interval: formData.interval,
        interval_unit: formData.interval_unit,
        start_time: formData.start_time,
        end_time: formData.end_time || null,
      };
      await api.recurringTodos.update(id, data);
      setEditingId(null);
      resetForm();
      loadRecurringTodos();
    } catch (err) {
      setFormErrors(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.recurringTodos.delete(id);
      loadRecurringTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recurring todo');
    }
  };

  const handlePause = async (id: number) => {
    try {
      await api.recurringTodos.pause(id);
      loadRecurringTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause recurring todo');
    }
  };

  const handleResume = async (id: number) => {
    try {
      await api.recurringTodos.resume(id);
      loadRecurringTodos();
      onTodosGenerated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume recurring todo');
    }
  };

  const startEdit = (todo: RecurringTodo) => {
    setEditingId(todo.id);
    setFormData({
      title: todo.title,
      note: todo.note || '',
      interval: todo.interval,
      interval_unit: todo.interval_unit,
      start_time: toDateTimeLocal(new Date(todo.start_time)),
      end_time: todo.end_time ? toDateTimeLocal(new Date(todo.end_time)) : '',
    });
    setFormErrors({});
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  const formatInterval = (interval: number, unit: IntervalUnit) => {
    return `Every ${interval} ${INTERVAL_UNIT_LABELS[unit].toLowerCase()}`;
  };

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-2xl max-h-[80vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Recurring Todos</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="alert alert-error alert-sm mb-3">
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Add Button / Form */}
        {isAdding ? (
          <div className="mb-4">
            <RecurringTodoForm
              formData={formData}
              setFormData={setFormData}
              errors={formErrors}
              clearFieldError={clearFieldError}
              onSave={handleAdd}
              onCancel={cancelEdit}
              saving={saving}
              saveLabel="Add"
            />
          </div>
        ) : (
          <button
            className="btn btn-ghost btn-sm justify-start gap-2 mb-4"
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              resetForm();
            }}
          >
            <Plus className="h-4 w-4" />
            Add Recurring Todo
          </button>
        )}

        {/* List */}
        <div className="space-y-2 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-sm"></span>
            </div>
          ) : recurringTodos.length === 0 ? (
            <div className="text-center text-base-content/50 py-8">No recurring todos</div>
          ) : (
            recurringTodos.map((todo) =>
              editingId === todo.id ? (
                <RecurringTodoForm
                  key={todo.id}
                  formData={formData}
                  setFormData={setFormData}
                  errors={formErrors}
                  clearFieldError={clearFieldError}
                  onSave={() => handleUpdate(todo.id)}
                  onCancel={cancelEdit}
                  saving={saving}
                  saveLabel="Save"
                />
              ) : (
                <div
                  key={todo.id}
                  className={`card card-compact bg-base-300 ${todo.state === 'paused' ? 'opacity-60' : ''}`}
                >
                  <div className="card-body">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{todo.title}</p>
                          {todo.state === 'paused' && (
                            <span className="badge badge-warning badge-xs">Paused</span>
                          )}
                        </div>
                        {todo.note && (
                          <p className="text-xs text-base-content/60 mt-1 line-clamp-2">
                            {todo.note}
                          </p>
                        )}
                        <p className="text-xs text-base-content/50 mt-1">
                          {formatInterval(todo.interval, todo.interval_unit)} &bull; Started{' '}
                          {formatDateTime(todo.start_time)}
                          {todo.end_time && ` • Ends ${formatDateTime(todo.end_time)}`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {todo.state === 'active' ? (
                          <button
                            className="btn btn-ghost btn-xs btn-circle text-warning"
                            onClick={() => handlePause(todo.id)}
                            title="Pause"
                          >
                            <Pause className="h-3 w-3" />
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-xs btn-circle text-success"
                            onClick={() => handleResume(todo.id)}
                            title="Resume"
                          >
                            <Play className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-xs btn-circle"
                          onClick={() => startEdit(todo)}
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs btn-circle text-error"
                          onClick={() => handleDelete(todo.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-base-300">
            <span className="text-xs text-base-content/50">{pagination.total} items</span>
            <div className="flex items-center gap-1">
              <button
                className="btn btn-ghost btn-xs btn-circle"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs px-2">
                {currentPage} / {Math.max(1, Math.ceil(pagination.total / pagination.per_page))}
              </span>
              <button
                className="btn btn-ghost btn-xs btn-circle"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(pagination.total / pagination.per_page)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
