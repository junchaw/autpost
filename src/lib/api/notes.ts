import { fetchApi } from './client';
import type { Pagination } from './types';

export interface Note {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateNoteInput {
  content: string;
}

export interface UpdateNoteInput {
  content: string;
}

export interface NoteListParams {
  page?: number;
  perPage?: number;
}

export const notesApi = {
  list: (params: NoteListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('per_page', params.perPage.toString());
    const query = searchParams.toString();
    return fetchApi<{ notes: Note[]; pagination: Pagination }>(`/notes${query ? `?${query}` : ''}`);
  },

  get: (id: number) => fetchApi<{ note: Note }>(`/notes/${id}`),

  create: (data: CreateNoteInput) =>
    fetchApi<{ message: string; note: Note }>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateNoteInput) =>
    fetchApi<{ message: string; note: Note }>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<{ message: string }>(`/notes/${id}`, {
      method: 'DELETE',
    }),

  restore: (id: number) =>
    fetchApi<{ message: string; note: Note }>(`/notes/${id}/restore`, {
      method: 'POST',
    }),
};
