import { fetchApi } from './client';
import type { Pagination } from './types';

export type TodoState = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Todo {
  id: number;
  user_id: number;
  recurring_todo_id: number | null;
  title: string;
  note: string | null;
  due_time: string | null;
  is_whole_day: boolean;
  state: TodoState;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateTodoInput {
  recurring_todo_id?: number | null;
  title: string;
  note?: string | null;
  due_time?: string | null;
  is_whole_day?: boolean;
  state?: TodoState;
}

export interface UpdateTodoInput {
  title?: string;
  note?: string | null;
  due_time?: string | null;
  is_whole_day?: boolean;
  state?: TodoState;
}

export interface TodoListParams {
  states?: TodoState[];
  page?: number;
  perPage?: number;
}

export const todosApi = {
  list: (params: TodoListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.states?.length) searchParams.set('states', params.states.join(','));
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('per_page', params.perPage.toString());
    const query = searchParams.toString();
    return fetchApi<{ todos: Todo[]; pagination: Pagination }>(`/todos${query ? `?${query}` : ''}`);
  },

  get: (id: number) => fetchApi<{ todo: Todo }>(`/todos/${id}`),

  create: (data: CreateTodoInput) =>
    fetchApi<{ message: string; todo: Todo }>('/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateTodoInput) =>
    fetchApi<{ message: string; todo: Todo }>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<{ message: string }>(`/todos/${id}`, {
      method: 'DELETE',
    }),

  restore: (id: number) =>
    fetchApi<{ message: string; todo: Todo }>(`/todos/${id}/restore`, {
      method: 'POST',
    }),
};
