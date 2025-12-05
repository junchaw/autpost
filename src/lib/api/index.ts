// Import APIs for the backward-compatible api object
import { accessLogsApi } from './access-logs';
import { authApi } from './auth';
import { healthApi } from './client';
import { configApi } from './config';
import { notesApi } from './notes';
import { recurringTodosApi } from './recurring-todos';
import { roleBindingsApi, rolesApi, usersApi } from './roles';
import { todosApi } from './todos';
import { userApi } from './user';

// Re-export all types and APIs
export {
  accessLogsApi,
  type AccessLog,
  type AccessLogListParams,
  type CreateAccessLogInput,
  type UpdateAccessLogInput,
} from './access-logs';
export { authApi, type LoginInput, type LoginResponse, type User } from './auth';
export {
  ApiValidationError,
  AuthenticationError,
  fetchApi,
  getAuthToken,
  healthApi,
  removeAuthToken,
  setAuthToken,
} from './client';
export {
  configApi,
  type DashboardConfig,
  type PanelConfig,
  type ResponsiveSize,
  type ScreenSize,
  type WidthMode,
} from './config';
export {
  notesApi,
  type CreateNoteInput as CreateNotebookInput,
  type CreateNoteInput,
  type Note,
  type Note as Notebook,
  type NoteListParams as NotebookListParams,
  type NoteListParams,
  type UpdateNoteInput as UpdateNotebookInput,
  type UpdateNoteInput,
} from './notes';
export {
  recurringTodosApi,
  type CreateRecurringTodoInput,
  type IntervalUnit,
  type RecurringTodo,
  type RecurringTodoState,
  type UpdateRecurringTodoInput,
} from './recurring-todos';
export {
  todosApi,
  type CreateTodoInput,
  type Todo,
  type TodoListParams,
  type TodoState,
  type UpdateTodoInput,
} from './todos';
export {
  userApi,
  type AvatarResponse,
  type ProfileResponse,
  type UpdateProfileInput,
} from './user';
export {
  roleBindingsApi,
  rolesApi,
  usersApi,
  type CreateRoleBindingInput,
  type CreateRoleInput,
  type Role,
  type RoleBinding,
  type RoleBindingListParams,
  type RoleListParams,
  type UpdateRoleInput,
  type UserListParams,
  type UserSummary,
} from './roles';
export type { Pagination } from './types';

// Backward compatible api object
export const api = {
  accessLogs: accessLogsApi,
  auth: authApi,
  health: healthApi.check,
  config: configApi,
  notes: notesApi,
  todos: todosApi,
  recurringTodos: recurringTodosApi,
  user: userApi,
  roles: rolesApi,
  roleBindings: roleBindingsApi,
  users: usersApi,
};
