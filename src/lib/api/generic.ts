import { fetchApi } from './client';
import type { Pagination } from './types';

// Field types enum matching backend FieldType enum
export type FieldType =
  | 'oid'
  | 'string'
  | 'text'
  | 'list'
  | 'map'
  | 'url'
  | 'code'
  | 'markdown'
  | 'number'
  | 'boolean'
  | 'timestamp'
  | 'date'
  | 'time'
  | 'image'
  | 'image_list'
  | 'file'
  | 'file_list'
  | 'reference'
  | 'field_reference'
  | 'fields_reference'
  | 'reference_list'
  | 'location';

export interface FieldTypeOption {
  value: FieldType;
  label: string;
}

export interface FieldSchema {
  type: FieldType;
  label?: string;
  description?: string;
  required?: boolean;
  multiple?: boolean;
  options?: string[];
  ref_type?: string;
  ref_field?: string;
  ref_fields?: string[];
}

export interface GenericDefinition {
  id: string;
  _type: 'definition';
  type: string;
  name: string;
  description?: string;
  icon?: string;
  parent?: string;
  fields: Record<string, FieldSchema>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDefinitionInput {
  type: string;
  name: string;
  description?: string;
  icon?: string;
  parent?: string;
  fields?: Record<string, FieldSchema>;
}

export interface UpdateDefinitionInput {
  type?: string;
  name?: string;
  description?: string;
  icon?: string;
  parent?: string;
  fields?: Record<string, FieldSchema>;
}

export interface DefinitionListParams {
  page?: number;
  perPage?: number;
}

export interface GenericResourceData {
  [key: string]: unknown;
}

export interface GenericResource {
  id: string;
  _type: string;
  _updated_at?: string;
  _created_at?: string;
  // All other fields from the definition are stored at root level
  [key: string]: unknown;
}

export interface CreateResourceInput {
  data: GenericResourceData;
}

export interface UpdateResourceInput {
  data: GenericResourceData;
}

export interface ResourceListParams {
  page?: number;
  perPage?: number;
}

export const definitionsApi = {
  list: (params: DefinitionListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('per_page', params.perPage.toString());
    const query = searchParams.toString();
    return fetchApi<{ definitions: GenericDefinition[]; pagination: Pagination }>(
      `/definitions${query ? `?${query}` : ''}`
    );
  },

  get: (id: string) => fetchApi<{ definition: GenericDefinition }>(`/definitions/${id}`),

  getByType: (type: string) =>
    fetchApi<{ definition: GenericDefinition }>(`/definitions/by-type/${type}`),

  getFieldTypes: () => fetchApi<{ field_types: FieldTypeOption[] }>('/definitions/field-types'),

  create: (data: CreateDefinitionInput) =>
    fetchApi<{ message: string; definition: GenericDefinition }>('/definitions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateDefinitionInput) =>
    fetchApi<{ message: string; definition: GenericDefinition }>(`/definitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>(`/definitions/${id}`, {
      method: 'DELETE',
    }),
};

export const resourcesApi = {
  list: (type: string, params: ResourceListParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('per_page', params.perPage.toString());
    const query = searchParams.toString();
    return fetchApi<{
      resources: GenericResource[];
      definition: GenericDefinition;
      pagination: Pagination;
    }>(`/resources/${type}${query ? `?${query}` : ''}`);
  },

  get: (type: string, id: string) =>
    fetchApi<{ resource: GenericResource; definition: GenericDefinition }>(
      `/resources/${type}/${id}`
    ),

  create: (type: string, data: CreateResourceInput) =>
    fetchApi<{ message: string; resource: GenericResource }>(`/resources/${type}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (type: string, id: string, data: UpdateResourceInput) =>
    fetchApi<{ message: string; resource: GenericResource }>(`/resources/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (type: string, id: string) =>
    fetchApi<{ message: string }>(`/resources/${type}/${id}`, {
      method: 'DELETE',
    }),
};
