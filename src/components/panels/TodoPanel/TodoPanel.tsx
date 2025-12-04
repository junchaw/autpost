import { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  List,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type { Pagination, Todo, TodoState } from '../../../lib/api';
import { api } from '../../../lib/api';
import { RecurringTodoModal } from './RecurringTodoModal';
import { TodoInlineForm } from './TodoInlineForm';

const PER_PAGE = 15;
const MAX_NOTE_PREVIEW_CHARS = 60;

function getNotePreview(note: string): string {
  const firstLine = note.split('\n')[0];
  if (firstLine.length <= MAX_NOTE_PREVIEW_CHARS) {
    return firstLine;
  }
  const truncated = firstLine.slice(0, MAX_NOTE_PREVIEW_CHARS);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

const STATE_ICONS: Record<TodoState, React.ReactNode> = {
  pending: <Circle className="h-4 w-4" />,
  in_progress: <Clock className="h-4 w-4 text-warning" />,
  completed: <Check className="h-4 w-4 text-success" />,
  cancelled: <X className="h-4 w-4 text-error" />,
};

const STATE_LABELS: Record<TodoState, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function TodoPanel() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<TodoState | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRecurringModal, setShowRecurringModal] = useState(false);

  // Inline editing state
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);

  // Inline note editing state
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTodos();
  }, [filter, currentPage]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const state = filter === 'all' ? undefined : filter;
      const response = await api.todos.list({
        state,
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
  };

  // Inline form functions
  const startAddTodo = () => {
    setIsAddingTodo(true);
    setEditingTodoId(null);
  };

  const startEditTodo = (todoId: number) => {
    setEditingTodoId(todoId);
    setIsAddingTodo(false);
  };

  const cancelForm = () => {
    setIsAddingTodo(false);
    setEditingTodoId(null);
  };

  const handleFormSave = () => {
    cancelForm();
    loadTodos();
  };

  // Inline note editing functions
  const startEditNote = (todo: Todo) => {
    setEditingNoteId(todo.id);
    // Set content after render
    setTimeout(() => {
      if (noteRef.current) {
        noteRef.current.textContent = todo.note || '';
        noteRef.current.focus();
        // Move cursor to end
        const range = document.createRange();
        range.selectNodeContents(noteRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 0);
  };

  const cancelNoteEdit = () => {
    setEditingNoteId(null);
  };

  const handleNoteSave = async (todoId: number) => {
    const content = noteRef.current?.textContent?.trim() || null;
    try {
      setSavingNote(true);
      await api.todos.update(todoId, { note: content });
      cancelNoteEdit();
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

  const formatDueTime = (dueTime: string | null, isWholeDay: boolean) => {
    if (!dueTime) return null;
    const date = new Date(dueTime);
    if (isWholeDay) {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 flex-wrap">
          <div className="tooltip tooltip-bottom" data-tip="All">
            <button
              className={`btn btn-xs btn-circle ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => {
                setFilter('all');
                setCurrentPage(1);
              }}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
          {(['pending', 'in_progress', 'completed', 'cancelled'] as TodoState[]).map((state) => (
            <div key={state} className="tooltip tooltip-bottom" data-tip={STATE_LABELS[state]}>
              <button
                className={`btn btn-xs btn-circle ${filter === state ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => {
                  setFilter(filter === state ? 'all' : state);
                  setCurrentPage(1);
                }}
              >
                {STATE_ICONS[state]}
              </button>
            </div>
          ))}
        </div>
        <div className="tooltip tooltip-bottom" data-tip="Recurring Todos">
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => setShowRecurringModal(true)}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error alert-sm mb-3">
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Add Todo Button or Form */}
      {isAddingTodo ? (
        <div className="mb-3">
          <TodoInlineForm onSave={handleFormSave} onCancel={cancelForm} />
        </div>
      ) : (
        <button className="btn btn-ghost btn-sm justify-start gap-2 mb-3" onClick={startAddTodo}>
          <Plus className="h-4 w-4" />
          Add Todo
        </button>
      )}

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-sm"></span>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center text-base-content/50 py-8">
            {filter === 'all' ? 'No active todos' : 'No todos found'}
          </div>
        ) : (
          todos.map((todo) =>
            editingTodoId === todo.id ? (
              <TodoInlineForm
                key={todo.id}
                todo={todo}
                onSave={handleFormSave}
                onCancel={cancelForm}
              />
            ) : (
              <div
                key={todo.id}
                className={`card card-compact bg-base-300 cursor-pointer hover:bg-base-300/80 ${todo.state === 'completed' ? 'opacity-60' : ''}`}
                onClick={() => startEditTodo(todo.id)}
              >
                <div className="card-body">
                  <div className="flex items-start gap-2">
                    <div className="dropdown dropdown-hover" onClick={(e) => e.stopPropagation()}>
                      <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle">
                        {STATE_ICONS[todo.state]}
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-200 rounded-box z-10 w-32 p-1 shadow"
                      >
                        {(['pending', 'in_progress', 'completed', 'cancelled'] as TodoState[]).map(
                          (state) => (
                            <li key={state}>
                              <button
                                onClick={() => handleStateChange(todo.id, state)}
                                className={todo.state === state ? 'active' : ''}
                              >
                                {STATE_ICONS[state]}
                                <span className="text-xs">{STATE_LABELS[state]}</span>
                              </button>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm ${todo.state === 'completed' ? 'line-through' : ''}`}
                      >
                        {todo.title}
                      </p>
                      {editingNoteId === todo.id ? (
                        <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                          <div
                            ref={noteRef}
                            contentEditable
                            className="text-xs text-base-content/80 outline-none border-b border-primary min-h-[1.25rem] whitespace-pre-wrap"
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') {
                                cancelNoteEdit();
                              } else if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleNoteSave(todo.id);
                              }
                            }}
                            onBlur={() => {
                              // Small delay to allow button clicks to register
                              setTimeout(() => {
                                if (editingNoteId === todo.id) {
                                  handleNoteSave(todo.id);
                                }
                              }, 150);
                            }}
                          />
                          <div className="flex justify-end gap-1 mt-1">
                            <button
                              className="btn btn-ghost btn-xs"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={cancelNoteEdit}
                              disabled={savingNote}
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <button
                              className="btn btn-primary btn-xs"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleNoteSave(todo.id)}
                              disabled={savingNote}
                            >
                              {savingNote ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="text-xs text-base-content/60 mt-1 text-left hover:text-base-content cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditNote(todo);
                          }}
                        >
                          {todo.note ? getNotePreview(todo.note) : '+ Add note'}
                        </button>
                      )}
                      {todo.due_time && (
                        <p className="text-xs text-base-content/50 mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDueTime(todo.due_time, todo.is_whole_day)}
                        </p>
                      )}
                      {todo.recurring_todo_id && (
                        <p className="text-xs text-info mt-1 flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          Recurring
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-ghost btn-xs btn-circle text-error"
                        onClick={() => handleDelete(todo.id)}
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
      {pagination && pagination.total > pagination.per_page && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300">
          <span className="text-xs text-base-content/50">{pagination.total} items</span>
          <div className="flex items-center gap-1">
            <button
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs px-2">
              {currentPage} / {Math.ceil(pagination.total / pagination.per_page)}
            </span>
            <button
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(pagination.total / pagination.per_page)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Recurring Todo Modal */}
      <RecurringTodoModal
        isOpen={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
        onTodosGenerated={loadTodos}
      />
    </div>
  );
}
