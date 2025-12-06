import { useRef, useState, useEffect } from 'react';
import { Calendar, Check, Circle, Hourglass, RefreshCw, Trash2, X } from 'lucide-react';
import type { Todo, TodoState } from '@/lib/api';

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

export const STATE_ICONS: Record<TodoState, React.ReactNode> = {
  pending: <Circle className="h-4 w-4" />,
  in_progress: <Hourglass className="h-4 w-4 text-warning" />,
  completed: <Check className="h-4 w-4 text-success" />,
  cancelled: <X className="h-4 w-4 text-error" />,
};

export const STATE_LABELS: Record<TodoState, string> = {
  pending: 'New',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

interface TodoItemProps {
  todo: Todo;
  isEditingTitle: boolean;
  isEditingNote: boolean;
  onStartEditTitle: () => void;
  onStartEditNote: () => void;
  onSaveTitle: (content: string) => void;
  onSaveNote: (content: string | null) => void;
  onCancelTitleEdit: () => void;
  onCancelNoteEdit: () => void;
  onStateChange: (state: TodoState) => void;
  onDelete: () => void;
  savingTitle?: boolean;
  savingNote?: boolean;
}

export function TodoItem({
  todo,
  isEditingTitle,
  isEditingNote,
  onStartEditTitle,
  onStartEditNote,
  onSaveTitle,
  onSaveNote,
  onCancelTitleEdit,
  onCancelNoteEdit,
  onStateChange,
  onDelete,
  savingTitle = false,
  savingNote = false,
}: TodoItemProps) {
  const titleRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Focus and select title when editing starts
  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.textContent = todo.title;
      titleRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(titleRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditingTitle, todo.title]);

  // Focus note when editing starts
  useEffect(() => {
    if (isEditingNote && noteRef.current) {
      noteRef.current.textContent = todo.note || '';
      noteRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(noteRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditingNote, todo.note]);

  // Cancel delete confirmation when clicking elsewhere
  useEffect(() => {
    if (!confirmingDelete) return;

    const handleClickOutside = () => {
      setConfirmingDelete(false);
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [confirmingDelete]);

  const handleDeleteClick = () => {
    if (confirmingDelete) {
      onDelete();
      setConfirmingDelete(false);
    } else {
      setConfirmingDelete(true);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancelTitleEdit();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSaveTitle(titleRef.current?.textContent?.trim() || '');
    }
  };

  const handleTitleBlur = () => {
    setTimeout(() => {
      if (isEditingTitle && !savingTitle) {
        onSaveTitle(titleRef.current?.textContent?.trim() || '');
      }
    }, 150);
  };

  const handleNoteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancelNoteEdit();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSaveNote(noteRef.current?.textContent?.trim() || null);
    }
  };

  const handleNoteBlur = () => {
    setTimeout(() => {
      if (isEditingNote && !savingNote) {
        onSaveNote(noteRef.current?.textContent?.trim() || null);
      }
    }, 150);
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

  return (
    <div
      className={`card card-compact bg-base-300 ${todo.state === 'completed' ? 'opacity-60' : ''}`}
    >
      <div className="card-body">
        <div className="flex items-start gap-2">
          {/* State dropdown */}
          <div className="dropdown dropdown-hover">
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
                      onClick={() => onStateChange(state)}
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

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            {isEditingTitle ? (
              <div
                ref={titleRef}
                contentEditable
                className={`font-medium text-sm outline-none border-b border-primary ${todo.state === 'completed' ? 'line-through' : ''}`}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleBlur}
              />
            ) : (
              <p
                className={`font-medium text-sm cursor-pointer hover:text-primary ${todo.state === 'completed' ? 'line-through' : ''}`}
                onClick={onStartEditTitle}
              >
                {todo.title}
              </p>
            )}

            {/* Note */}
            {isEditingNote ? (
              <div className="mt-1">
                <div
                  ref={noteRef}
                  contentEditable
                  className="text-xs text-base-content/80 outline-none border-b border-primary min-h-[1.25rem] whitespace-pre-wrap"
                  onKeyDown={handleNoteKeyDown}
                  onBlur={handleNoteBlur}
                />
              </div>
            ) : (
              <button
                className="text-xs text-base-content/60 mt-1 text-left hover:text-base-content cursor-pointer"
                onClick={onStartEditNote}
              >
                {todo.note ? getNotePreview(todo.note) : '+ Add note'}
              </button>
            )}

            {/* Due time */}
            {todo.due_time && (
              <p className="text-xs text-base-content/50 mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDueTime(todo.due_time, todo.is_whole_day)}
              </p>
            )}

            {/* Recurring indicator */}
            {todo.recurring_todo_id && (
              <p className="text-xs text-info mt-1 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Recurring
              </p>
            )}
          </div>

          {/* Delete button */}
          <div className="flex gap-1">
            <div
              className="tooltip tooltip-left"
              data-tip={confirmingDelete ? 'Click to confirm' : 'Delete'}
            >
              <button
                className={`btn btn-ghost btn-xs btn-circle ${confirmingDelete ? 'text-success' : 'text-error'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick();
                }}
              >
                {confirmingDelete ? <Check className="h-3 w-3" /> : <Trash2 className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
