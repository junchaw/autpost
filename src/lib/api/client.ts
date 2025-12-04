const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Token storage key
const TOKEN_KEY = 'auth_token';

// Get stored auth token
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Set auth token
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Remove auth token
export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Laravel validation error response format
export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

// Custom error class for API validation errors
export class ApiValidationError extends Error {
  public errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message);
    this.name = 'ApiValidationError';
    this.errors = errors;
  }

  // Get the first error message for a specific field
  getFieldError(field: string): string | undefined {
    return this.errors[field]?.[0];
  }

  // Get all field errors as a flat object (first error per field)
  getFieldErrors(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [field, messages] of Object.entries(this.errors)) {
      if (messages.length > 0) {
        result[field] = messages[0];
      }
    }
    return result;
  }
}

// Custom error for authentication failures
export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // Handle 401 Unauthorized
    if (response.status === 401) {
      removeAuthToken();
      throw new AuthenticationError();
    }

    // Try to parse the error response as JSON
    try {
      const errorData = await response.json();
      // Check if it's a Laravel validation error
      if (errorData.errors && typeof errorData.errors === 'object') {
        throw new ApiValidationError(errorData.message || 'Validation failed', errorData.errors);
      }
      // Other JSON error response
      throw new Error(errorData.message || `API request failed: ${response.statusText}`);
    } catch (e) {
      // If it's already our custom error, rethrow it
      if (e instanceof ApiValidationError || e instanceof AuthenticationError) {
        throw e;
      }
      // If JSON parsing failed, throw generic error
      throw new Error(`API request failed: ${response.statusText}`);
    }
  }

  return response.json();
}

export async function fetchApiFormData<T>(endpoint: string, formData: FormData): Promise<T> {
  const url = `${API_URL}/api${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeAuthToken();
      throw new AuthenticationError();
    }

    try {
      const errorData = await response.json();
      if (errorData.errors && typeof errorData.errors === 'object') {
        throw new ApiValidationError(errorData.message || 'Validation failed', errorData.errors);
      }
      throw new Error(errorData.message || `API request failed: ${response.statusText}`);
    } catch (e) {
      if (e instanceof ApiValidationError || e instanceof AuthenticationError) {
        throw e;
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }
  }

  return response.json();
}

export const healthApi = {
  check: () => fetchApi<{ status: string; timestamp: string }>('/health'),
};
