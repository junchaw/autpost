import { ArrowLeft, ChevronDown, Database, Eye, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { FormInput, FormTextarea } from '@/components/ui/FormField';
import { Pagination } from '@/components/ui/Pagination';
import {
  api,
  type FieldSchema,
  type FieldTypeOption,
  type GenericDefinition,
  type Pagination as PaginationType,
} from '@/lib/api';

interface FieldEditorProps {
  fields: Record<string, FieldSchema>;
  onChange: (fields: Record<string, FieldSchema>) => void;
  fieldTypes: FieldTypeOption[];
}

function FieldEditor({ fields, onChange, fieldTypes }: FieldEditorProps) {
  const [newFieldName, setNewFieldName] = useState('');
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const toggleField = (key: string) => {
    setExpandedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const addField = () => {
    if (!newFieldName.trim()) return;
    const fieldKey = newFieldName.trim().toLowerCase().replace(/\s+/g, '_');
    if (fields[fieldKey]) {
      toast.error('Field already exists');
      return;
    }
    onChange({
      ...fields,
      [fieldKey]: { type: 'string', label: newFieldName.trim() },
    });
    setExpandedFields((prev) => new Set(prev).add(fieldKey));
    setNewFieldName('');
  };

  const removeField = (key: string) => {
    const newFields = { ...fields };
    delete newFields[key];
    onChange(newFields);
  };

  const updateField = (key: string, schema: FieldSchema) => {
    onChange({ ...fields, [key]: schema });
  };

  return (
    <div className="space-y-2">
      {Object.entries(fields).map(([key, schema]) => {
        const isExpanded = expandedFields.has(key);
        return (
          <div key={key} className="border border-base-300 rounded-lg overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 bg-base-200 hover:bg-base-300 transition-colors text-left"
              onClick={() => toggleField(key)}
            >
              <div className="flex items-center gap-2">
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
                <span className="font-mono text-sm font-medium">{key}</span>
                <span className="text-xs text-base-content/60">({schema.type})</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-xs text-error"
                onClick={(e) => {
                  e.stopPropagation();
                  removeField(key);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </button>
            <div
              className={`transition-all duration-200 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label py-0">
                      <span className="label-text text-xs">Type</span>
                    </label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={schema.type}
                      onChange={(e) =>
                        updateField(key, { ...schema, type: e.target.value as FieldSchema['type'] })
                      }
                    >
                      {fieldTypes.map((ft) => (
                        <option key={ft.value} value={ft.value}>
                          {ft.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label py-0">
                      <span className="label-text text-xs">Label</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      value={schema.label || ''}
                      onChange={(e) => updateField(key, { ...schema, label: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="label cursor-pointer gap-2 p-0">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={schema.required || false}
                      onChange={(e) => updateField(key, { ...schema, required: e.target.checked })}
                    />
                    <span className="label-text text-xs">Required</span>
                  </label>
                  <label className="label cursor-pointer gap-2 p-0">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={schema.multiple || false}
                      onChange={(e) => updateField(key, { ...schema, multiple: e.target.checked })}
                    />
                    <span className="label-text text-xs">Multiple</span>
                  </label>
                </div>
                {(schema.type === 'reference' || schema.type === 'reference_list') && (
                  <div>
                    <label className="label py-0">
                      <span className="label-text text-xs">Reference Type</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      value={schema.ref_type || ''}
                      onChange={(e) => updateField(key, { ...schema, ref_type: e.target.value })}
                      placeholder="e.g., user, post"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex gap-2">
        <input
          type="text"
          className="input input-bordered input-sm flex-1"
          value={newFieldName}
          onChange={(e) => setNewFieldName(e.target.value)}
          placeholder="New field name..."
          onKeyDown={(e) => e.key === 'Enter' && addField()}
        />
        <button className="btn btn-primary btn-sm" onClick={addField}>
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
}

interface DefinitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  definition: GenericDefinition | null;
  initialMode: 'view' | 'create';
  fieldTypes: FieldTypeOption[];
  onSave: () => void;
}

function DefinitionModal({
  isOpen,
  onClose,
  definition,
  initialMode,
  fieldTypes,
  onSave,
}: DefinitionModalProps) {
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    description: '',
    icon: '',
    parent: '',
    fields: {} as Record<string, FieldSchema>,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCreate = initialMode === 'create';

  useEffect(() => {
    if (isOpen) {
      if (definition && !isCreate) {
        setFormData({
          type: definition.type,
          name: definition.name,
          description: definition.description || '',
          icon: definition.icon || '',
          parent: definition.parent || '',
          fields: definition.fields || {},
        });
      } else if (isCreate) {
        setFormData({
          type: '',
          name: '',
          description: '',
          icon: '',
          parent: '',
          fields: {},
        });
      }
      setErrors({});
    }
  }, [isOpen, definition, isCreate]);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.type.trim()) newErrors.type = 'Type is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      if (isCreate) {
        await api.definitions.create({
          type: formData.type.trim(),
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          icon: formData.icon.trim() || undefined,
          parent: formData.parent.trim() || undefined,
          fields: formData.fields,
        });
        toast.success('Definition created');
      } else if (definition) {
        await api.definitions.update(definition._id, {
          type: formData.type.trim(),
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          icon: formData.icon.trim() || undefined,
          parent: formData.parent.trim() || undefined,
          fields: formData.fields,
        });
        toast.success('Definition updated');
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

  const title = isCreate ? 'Create Definition' : 'Definition';

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
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Type Identifier"
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value })}
              placeholder="e.g., blog_post, product"
              error={errors.type}
            />
            <FormInput
              label="Display Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="e.g., Blog Post, Product"
              error={errors.name}
            />
          </div>

          <FormTextarea
            label="Description"
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Description of this resource type"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Icon"
              value={formData.icon}
              onChange={(value) => setFormData({ ...formData, icon: value })}
              placeholder="Icon name or URL"
            />
            <FormInput
              label="Parent Type"
              value={formData.parent}
              onChange={(value) => setFormData({ ...formData, parent: value })}
              placeholder="Parent definition type"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm mb-1">
              Schema ({Object.keys(formData.fields).length} fields)
            </span>
            <FieldEditor
              fields={formData.fields}
              onChange={(fields) => setFormData({ ...formData, fields })}
              fieldTypes={fieldTypes}
            />
          </div>

          {definition && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <span className="text-sm text-base-content/60">ID</span>
                <p className="font-mono text-sm">{definition._id}</p>
              </div>
              {definition.created_at && (
                <div>
                  <span className="text-sm text-base-content/60">Created</span>
                  <p className="font-mono text-sm">
                    {new Date(definition.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-sm" /> : 'Save'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

export function GenericDefinitionsPage() {
  const [definitions, setDefinitions] = useState<GenericDefinition[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fieldTypes, setFieldTypes] = useState<FieldTypeOption[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDefinition, setSelectedDefinition] = useState<GenericDefinition | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'create'>('view');

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadDefinitions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.definitions.list({ page, perPage: 20 });
      setDefinitions(response.definitions);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load definitions');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadFieldTypes = useCallback(async () => {
    try {
      const response = await api.definitions.getFieldTypes();
      setFieldTypes(response.field_types);
    } catch {
      // Fallback to basic types if endpoint fails
      setFieldTypes([
        { value: 'string', label: 'String' },
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'boolean', label: 'Boolean' },
        { value: 'reference', label: 'Reference' },
      ]);
    }
  }, []);

  useEffect(() => {
    loadDefinitions();
    loadFieldTypes();
  }, [loadDefinitions, loadFieldTypes]);

  const openModal = (def: GenericDefinition | null, mode: 'view' | 'create') => {
    setSelectedDefinition(def);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.definitions.delete(deleteId);
      toast.success('Definition deleted');
      loadDefinitions();
    } catch {
      toast.error('Failed to delete definition');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1 gap-2">
          <Link to="/admin" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Database className="w-5 h-5" />
          <h1 className="text-xl font-bold">Generic Schema Definitions</h1>
        </div>
        <div className="flex-none">
          <button className="btn btn-primary btn-sm" onClick={() => openModal(null, 'create')}>
            <Plus className="w-4 h-4" />
            Add Definition
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-7xl">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : definitions.length === 0 ? (
              <div className="text-center py-20 text-base-content/60">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No definitions found</p>
                <p className="text-sm mt-1">Create a definition to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {definitions.map((def) => (
                      <tr key={def._id}>
                        <td>
                          <span className="badge badge-primary font-mono">{def.type}</span>
                        </td>
                        <td className="font-medium">{def.name}</td>
                        <td className="max-w-[200px] truncate text-sm" title={def.description}>
                          {def.description || '-'}
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => openModal(def, 'view')}
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/admin/resources/${def.type}`}
                              className="btn btn-ghost btn-xs"
                              title="View Resources"
                            >
                              <Database className="w-4 h-4" />
                            </Link>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => setDeleteId(def._id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* Definition Modal */}
      <DefinitionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        definition={selectedDefinition}
        initialMode={modalMode}
        fieldTypes={fieldTypes}
        onSave={loadDefinitions}
      />

      {/* Delete Confirmation */}
      {deleteId && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete this definition? This action cannot be undone.
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
