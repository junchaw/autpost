import { useState, useEffect, useRef } from 'react';
import { api } from '../../../lib/api';
import type { Todo } from '../../../lib/api';
import { FormModal, type FormErrors } from '../../FormModal';
import { TrixEditor } from '../../TrixEditor';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  onSave?: () => void;
}

export function NoteModal({ isOpen, onClose, todo, onSave }: NoteModalProps) {
  const [content, setContent] = useState('');
  const contentRef = useRef(content);
  contentRef.current = content;

  const isEditing = !!todo?.note;

  useEffect(() => {
    if (isOpen && todo) {
      setContent(todo.note || '');
    }
  }, [isOpen, todo]);

  const validate = (): FormErrors | null => {
    const errors: FormErrors = {};
    if (!contentRef.current.trim()) {
      errors.note = 'Note content is required';
    }
    return Object.keys(errors).length > 0 ? errors : null;
  };

  const getFormData = () => ({ note: contentRef.current });

  const handleSave = async (data: { note: string }) => {
    if (!todo) return;
    await api.todos.update(todo.id, { note: data.note.trim() || null });
    onSave?.();
  };

  if (!todo) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      title={isEditing ? 'Edit Note' : 'Add Note'}
      validate={validate}
      getFormData={getFormData}
    >
      {({ errors, clearFieldError }) => (
        <>
          <p className="text-sm text-base-content/60 -mt-2 mb-4">{todo.title}</p>
          <div className={errors.note ? 'ring-2 ring-error rounded-lg' : ''}>
            <TrixEditor
              value={content}
              onChange={(value) => {
                setContent(value);
                clearFieldError('note');
              }}
              placeholder="Write your note here..."
              autoFocus
            />
          </div>
          {errors.note && <p className="text-error text-sm mt-1">{errors.note}</p>}
        </>
      )}
    </FormModal>
  );
}
