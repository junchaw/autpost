import { ArrowLeft, Eye, FileText, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/Pagination';
import {
  api,
  type FieldSchema,
  type GenericDefinition,
  type GenericResource,
  type GenericResourceData,
  type Pagination as PaginationType,
} from '@/lib/api';

interface DynamicFieldProps {
  fieldKey: string;
  schema: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly?: boolean;
}

function DynamicField({ fieldKey, schema, value, onChange, readOnly }: DynamicFieldProps) {
  const label = schema.label || fieldKey;

  const renderInput = () => {
    switch (schema.type) {
      case 'text':
      case 'markdown':
      case 'code':
        return (
          <textarea
            className="textarea textarea-bordered w-full h-24"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            className="input input-bordered w-full"
            value={(value as number) ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            readOnly={readOnly}
          />
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            className="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={readOnly}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            className="input input-bordered w-full"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
          />
        );

      case 'timestamp':
        return (
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            className="input input-bordered w-full"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
            placeholder="https://..."
          />
        );

      case 'list': {
        const listValue = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {listValue.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1"
                  value={item || ''}
                  onChange={(e) => {
                    const newList = [...listValue];
                    newList[idx] = e.target.value;
                    onChange(newList);
                  }}
                  readOnly={readOnly}
                />
                {!readOnly && (
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => {
                      const newList = listValue.filter((_, i) => i !== idx);
                      onChange(newList);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {!readOnly && (
              <button className="btn btn-ghost btn-sm" onClick={() => onChange([...listValue, ''])}>
                <Plus className="w-4 h-4" /> Add item
              </button>
            )}
          </div>
        );
      }

      default:
        return (
          <input
            type="text"
            className="input input-bordered w-full"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readOnly}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        );
    }
  };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">
          {label}
          {schema.required && <span className="text-error ml-1">*</span>}
        </span>
        <span className="label-text-alt text-base-content/50">{schema.type}</span>
      </label>
      {renderInput()}
      {schema.description && (
        <label className="label">
          <span className="label-text-alt text-base-content/60">{schema.description}</span>
        </label>
      )}
    </div>
  );
}

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: GenericResource | null;
  definition: GenericDefinition;
  mode: 'view' | 'edit' | 'create';
  onSave: () => void;
}

function ResourceModal({
  isOpen,
  onClose,
  resource,
  definition,
  mode,
  onSave,
}: ResourceModalProps) {
  const [formData, setFormData] = useState<GenericResourceData>({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && resource && mode !== 'create') {
      // Extract data fields from resource (exclude system fields)
      const { id: _id, _type, _updated_at, _created_at, ...resourceData } = resource;
      setFormData(resourceData as GenericResourceData);
    } else if (mode === 'create') {
      setFormData({});
    }
    setErrors({});
  }, [isOpen, resource, mode]);

  const handleSave = async () => {
    // Validate required fields
    const newErrors: Record<string, string> = {};
    const fields = definition.fields || {};

    for (const [key, schema] of Object.entries(fields)) {
      if (schema.required) {
        const value = formData[key];
        if (value === undefined || value === null || value === '') {
          newErrors[key] = `${schema.label || key} is required`;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      if (mode === 'create') {
        await api.resources.create(definition.type, { data: formData });
        toast.success('Resource created');
      } else if (mode === 'edit' && resource) {
        await api.resources.update(definition.type, resource.id, { data: formData });
        toast.success('Resource updated');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title =
    mode === 'create'
      ? `Create ${definition.name}`
      : mode === 'edit'
        ? `Edit ${definition.name}`
        : `View ${definition.name}`;

  const fields = definition.fields || {};
  const fieldEntries = Object.entries(fields);

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[60vh]">
          {fieldEntries.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              No fields defined for this resource type
            </div>
          ) : (
            fieldEntries.map(([key, schema]) => (
              <div key={key}>
                <DynamicField
                  fieldKey={key}
                  schema={schema}
                  value={formData[key]}
                  onChange={(value) => setFormData({ ...formData, [key]: value })}
                  readOnly={isReadOnly}
                />
                {errors[key] && <span className="text-error text-sm">{errors[key]}</span>}
              </div>
            ))
          )}

          {resource && mode === 'view' && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <span className="text-sm text-base-content/60">ID</span>
                <p className="font-mono text-sm">{resource.id}</p>
              </div>
              {resource._updated_at && (
                <div>
                  <span className="text-sm text-base-content/60">Updated</span>
                  <p className="font-mono text-sm">
                    {new Date(resource._updated_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </button>
          {!isReadOnly && (
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="loading loading-spinner loading-sm" /> : 'Save'}
            </button>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

export function GenericResourcesPage() {
  const { type } = useParams<{ type: string }>();
  const [resources, setResources] = useState<GenericResource[]>([]);
  const [definition, setDefinition] = useState<GenericDefinition | null>(null);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<GenericResource | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadResources = useCallback(async () => {
    if (!type) return;

    setLoading(true);
    try {
      const response = await api.resources.list(type, { page, perPage: 20 });
      setResources(response.resources);
      setDefinition(response.definition);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [type, page]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const openModal = (res: GenericResource | null, mode: 'view' | 'edit' | 'create') => {
    setSelectedResource(res);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId || !type) return;
    try {
      await api.resources.delete(type, deleteId);
      toast.success('Resource deleted');
      loadResources();
    } catch {
      toast.error('Failed to delete resource');
    } finally {
      setDeleteId(null);
    }
  };

  const getDisplayValue = (resource: GenericResource): string => {
    if (!definition) return resource.id;
    const fields = definition.fields || {};

    // Try to find a name/title field
    for (const key of ['name', 'title', 'label']) {
      if (fields[key] && resource[key]) {
        return String(resource[key]);
      }
    }

    // Return first string field value
    for (const [key, schema] of Object.entries(fields)) {
      if (schema.type === 'string' && resource[key]) {
        return String(resource[key]);
      }
    }

    return resource.id;
  };

  if (!type) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error">No resource type specified</p>
          <Link to="/admin/definitions" className="btn btn-primary mt-4">
            Back to Definitions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1 gap-2">
          <Link to="/admin/definitions" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <FileText className="w-5 h-5" />
          <div>
            <h1 className="text-xl font-bold">{definition?.name || type}</h1>
            {definition?.description && (
              <p className="text-sm text-base-content/60">{definition.description}</p>
            )}
          </div>
        </div>
        <div className="flex-none">
          {definition && (
            <button className="btn btn-primary btn-sm" onClick={() => openModal(null, 'create')}>
              <Plus className="w-4 h-4" />
              Add {definition.name}
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-7xl">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-20 text-base-content/60">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No {definition?.name || 'resources'} found</p>
                <p className="text-sm mt-1">Create one to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      {definition &&
                        Object.entries(definition.fields || {})
                          .slice(0, 3)
                          .map(([key, schema]) => <th key={key}>{schema.label || key}</th>)}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource) => (
                      <tr key={resource.id}>
                        <td className="font-mono text-sm max-w-[100px] truncate">{resource.id}</td>
                        <td className="font-medium">{getDisplayValue(resource)}</td>
                        {definition &&
                          Object.entries(definition.fields || {})
                            .slice(0, 3)
                            .map(([key, schema]) => (
                              <td key={key} className="max-w-[150px] truncate">
                                {schema.type === 'boolean'
                                  ? resource[key]
                                    ? 'Yes'
                                    : 'No'
                                  : String(resource[key] || '-')}
                              </td>
                            ))}
                        <td>
                          <div className="flex gap-1">
                            <div className="tooltip" data-tip="View">
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => openModal(resource, 'view')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="tooltip" data-tip="Edit">
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => openModal(resource, 'edit')}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="tooltip" data-tip="Delete">
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => setDeleteId(resource.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
          </div>
        </div>
      </div>

      {/* Resource Modal */}
      {definition && (
        <ResourceModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          resource={selectedResource}
          definition={definition}
          mode={modalMode}
          onSave={loadResources}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete this {definition?.name || 'resource'}? This action
              cannot be undone.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setDeleteId(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
