import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox, Plus, X } from 'lucide-react';
import type { Pagination, Todo, TodoState } from '@/lib/api';
import { api } from '@/lib/api';
import { TodoItem, STATE_ICONS, STATE_LABELS } from './TodoItem';

const PER_PAGE = 15;

type FilterType = TodoState | 'inbox';

interface TodoListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TodoListModal({ isOpen, onClose }: TodoListModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterType>('inbox');
  const [currentPage, setCurrentPage] = useState(1);

  // Inline editing state
  const [editingTitleId, setEditingTitleId] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [savingTitle, setSavingTitle] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      let states: TodoState[] | undefined;
      if (filter === 'inbox') {
        states = ['pending', 'in_progress'];
      } else {
        states = [filter];
      }
      const response = await api.todos.list({
        states,
        page: currentPage,
        perPage: PER_PAGE,
      });
      setTodos(response.todos);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage]);

  // Dialog open/close effect
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      loadTodos();
    } else {
      dialog.close();
    }
  }, [isOpen, loadTodos]);

  // Handle native dialog close (e.g., Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  // Add new todo
  const handleAddTodo = async () => {
    try {
      const response = await api.todos.create({ title: 'New todo' });
      await loadTodos();
      setEditingTitleId(response.todo.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  };

  const handleTitleSave = async (todoId: number, content: string) => {
    if (!content) {
      try {
        await api.todos.delete(todoId);
        setEditingTitleId(null);
        loadTodos();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete todo');
      }
      return;
    }
    try {
      setSavingTitle(true);
      await api.todos.update(todoId, { title: content });
      setEditingTitleId(null);
      loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save title');
    } finally {
      setSavingTitle(false);
    }
  };

  const handleNoteSave = async (todoId: number, content: string | null) => {
    try {
      setSavingNote(true);
      await api.todos.update(todoId, { note: content });
      setEditingNoteId(null);
      loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleStateChange = async (id: number, state: TodoState) => {
    try {
      await api.todos.update(id, { state });
      loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.todos.delete(id);
      loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box max-w-2xl max-h-[80vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Todo Items</h3>
          <div className="tooltip tooltip-left" data-tip="Close">
            <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 mb-4">
          <div className="tooltip tooltip-bottom" data-tip="Inbox">
            <button
              className={`btn btn-xs btn-circle ${filter === 'inbox' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                setFilter('inbox');
                setCurrentPage(1);
              }}
            >
              <Inbox className="h-3.5 w-3.5" />
            </button>
          </div>
          {(['pending', 'in_progress', 'completed', 'cancelled'] as TodoState[]).map((state) => (
            <div key={state} className="tooltip tooltip-bottom" data-tip={STATE_LABELS[state]}>
              <button
                className={`btn btn-xs btn-circle ${filter === state ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => {
                  setFilter(filter === state ? 'inbox' : state);
                  setCurrentPage(1);
                }}
              >
                {STATE_ICONS[state]}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="alert alert-error alert-sm mb-3">
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Add Todo Button */}
        <button className="btn btn-ghost btn-sm justify-start gap-2 mb-3" onClick={handleAddTodo}>
          <Plus className="h-4 w-4" />
          Add Todo
        </button>

        {/* Todo List */}
        <div className="space-y-2 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-sm"></span>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center text-base-content/50 py-8">No todos found</div>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isEditingTitle={editingTitleId === todo.id}
                isEditingNote={editingNoteId === todo.id}
                onStartEditTitle={() => {
                  setEditingTitleId(todo.id);
                  setEditingNoteId(null);
                }}
                onStartEditNote={() => {
                  setEditingNoteId(todo.id);
                  setEditingTitleId(null);
                }}
                onSaveTitle={(content) => handleTitleSave(todo.id, content)}
                onSaveNote={(content) => handleNoteSave(todo.id, content)}
                onCancelTitleEdit={() => setEditingTitleId(null)}
                onCancelNoteEdit={() => setEditingNoteId(null)}
                onStateChange={(state) => handleStateChange(todo.id, state)}
                onDelete={() => handleDelete(todo.id)}
                savingTitle={savingTitle}
                savingNote={savingNote}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-base-300">
            <span className="text-xs text-base-content/50">{pagination.total} items</span>
            <div className="flex items-center gap-1">
              <div className="tooltip" data-tip="Previous page">
                <button
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs px-2">
                {currentPage} / {Math.max(1, Math.ceil(pagination.total / pagination.per_page))}
              </span>
              <div className="tooltip" data-tip="Next page">
                <button
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(pagination.total / pagination.per_page)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
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
