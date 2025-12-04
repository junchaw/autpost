import type { Note } from '@/lib/api/notes';
import { ChevronLeft, ChevronRight, Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { Pagination } from '../../../lib/api';
import { api } from '../../../lib/api';
import { TrixEditor } from '../../TrixEditor';

const PER_PAGE = 10;
const MAX_PREVIEW_CHARS = 50;

function getPreviewText(content: string): string {
  const firstLine = content.split('\n')[0];
  if (firstLine.length <= MAX_PREVIEW_CHARS) {
    return firstLine;
  }
  // Truncate to last complete word within limit
  const truncated = firstLine.slice(0, MAX_PREVIEW_CHARS);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

export function NotePanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    loadNotes();
  }, [currentPage]);

  const isModalOpen = isAddingNew || editingNote !== null;

  // Dialog open/close effect
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isModalOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isModalOpen]);

  const closeModal = useCallback(() => {
    setEditingNote(null);
    setIsAddingNew(false);
    setModalContent('');
  }, []);

  // Handle native dialog close (e.g., Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.addEventListener('close', closeModal);
    return () => dialog.removeEventListener('close', closeModal);
  }, [closeModal]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await api.notes.list({
        page: currentPage,
        perPage: PER_PAGE,
      });
      setNotes(response.notes);
      setPagination(response.pagination);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsAddingNew(true);
    setEditingNote(null);
    setModalContent('');
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setIsAddingNew(false);
    setModalContent(note.content);
  };

  const handleSave = async () => {
    if (!modalContent.trim()) return;

    try {
      if (isAddingNew) {
        await api.notes.create({
          content: modalContent.trim(),
        });
      } else if (editingNote) {
        await api.notes.update(editingNote.id, { content: modalContent.trim() });
      }
      closeModal();
      loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.notes.delete(id);
      loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="alert alert-error alert-sm mb-3">
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Add Note Button */}
      <button className="btn btn-ghost btn-sm justify-start gap-2 mb-3" onClick={openAddModal}>
        <Plus className="h-4 w-4" />
        Add Note
      </button>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-sm"></span>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center text-base-content/50 py-8">No notes found</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="card card-compact bg-base-300">
              <div className="card-body">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{getPreviewText(note.content)}</p>
                    <p className="text-xs text-base-content/50 mt-1">
                      {formatDate(note.updated_at)}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      className="btn btn-ghost btn-xs btn-circle"
                      onClick={() => openEditModal(note)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      className="btn btn-ghost btn-xs btn-circle text-error"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > pagination.per_page && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300">
          <span className="text-xs text-base-content/50">{pagination.total} notes</span>
          <div className="flex items-center gap-1">
            <button
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs px-2">
              {currentPage} / {Math.ceil(pagination.total / pagination.per_page)}
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

      {/* Add/Edit Note Modal */}
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">{isAddingNew ? 'Add Note' : 'Edit Note'}</h3>
          <TrixEditor
            value={modalContent}
            onChange={setModalContent}
            placeholder="Write your note here..."
            autoFocus
          />
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={closeModal}>
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
