import { fetchApi } from './client';

export type RecurringTodoState = 'active' | 'paused';
export type IntervalUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface RecurringTodo {
  id: number;
  user_id: number;
  title: string;
  note: string | null;
  interval: number;
  interval_unit: IntervalUnit;
  start_time: string;
  end_time: string | null;
  state: RecurringTodoState;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateRecurringTodoInput {
  title: string;
  note?: string | null;
  interval: number;
  interval_unit: IntervalUnit;
  start_time: string;
  end_time?: string | null;
  state?: RecurringTodoState;
}

export interface UpdateRecurringTodoInput {
  title?: string;
  note?: string | null;
  interval?: number;
  interval_unit?: IntervalUnit;
  start_time?: string;
  end_time?: string | null;
  state?: RecurringTodoState;
}

export const recurringTodosApi = {
  list: (state?: RecurringTodoState) =>
    fetchApi<{ recurring_todos: RecurringTodo[] }>(
      `/recurring-todos${state ? `?state=${state}` : ''}`
    ),

  get: (id: number) => fetchApi<{ recurring_todo: RecurringTodo }>(`/recurring-todos/${id}`),

  create: (data: CreateRecurringTodoInput) =>
    fetchApi<{ message: string; recurring_todo: RecurringTodo }>('/recurring-todos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateRecurringTodoInput) =>
    fetchApi<{ message: string; recurring_todo: RecurringTodo }>(`/recurring-todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<{ message: string }>(`/recurring-todos/${id}`, {
      method: 'DELETE',
    }),

  pause: (id: number) =>
    fetchApi<{ message: string; recurring_todo: RecurringTodo }>(`/recurring-todos/${id}/pause`, {
      method: 'POST',
    }),

  resume: (id: number) =>
    fetchApi<{ message: string; recurring_todo: RecurringTodo }>(`/recurring-todos/${id}/resume`, {
      method: 'POST',
    }),
};
