import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api, type Pagination, type Role, type RoleBinding, type UserSummary } from '../lib/api';

const AVAILABLE_PERMISSIONS = ['hard_delete', 'admin', 'manage_users', 'manage_roles'];

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  mode: 'view' | 'edit' | 'create';
  onSave: () => void;
}

function RoleModal({ isOpen, onClose, role, mode, onSave }: RoleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && role && mode !== 'create') {
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || [],
      });
    } else if (mode === 'create') {
      setFormData({ name: '', description: '', permissions: [] });
    }
    setErrors({});
  }, [isOpen, role, mode]);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      if (mode === 'create') {
        await api.roles.create({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          permissions: formData.permissions,
        });
        toast.success('Role created');
      } else if (mode === 'edit' && role) {
        await api.roles.update(role.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          permissions: formData.permissions,
        });
        toast.success('Role updated');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permission: string) => {
    if (mode === 'view') return;
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Create Role' : mode === 'edit' ? 'Edit Role' : 'View Role';

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              readOnly={isReadOnly}
              placeholder="e.g., admin, moderator"
            />
            {errors.name && <span className="text-error text-sm mt-1">{errors.name}</span>}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-20"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              readOnly={isReadOnly}
              placeholder="Role description (optional)"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Permissions</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <label
                  key={permission}
                  className={`cursor-pointer label gap-2 p-2 rounded-lg border ${
                    formData.permissions.includes(permission)
                      ? 'bg-primary/10 border-primary'
                      : 'bg-base-200 border-base-300'
                  } ${isReadOnly ? 'cursor-default' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary"
                    checked={formData.permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    disabled={isReadOnly}
                  />
                  <span className="label-text text-sm">{permission}</span>
                </label>
              ))}
            </div>
          </div>

          {role && mode === 'view' && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <span className="text-sm text-base-content/60">Created</span>
                <p className="font-mono text-sm">{new Date(role.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm text-base-content/60">Updated</span>
                <p className="font-mono text-sm">{new Date(role.updated_at).toLocaleString()}</p>
              </div>
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

interface RoleBindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  onSave: () => void;
}

function RoleBindingModal({ isOpen, onClose, roles, onSave }: RoleBindingModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId(null);
      setSelectedRoleId(null);
      setUserSearch('');
      setUsers([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const searchUsers = async () => {
      if (userSearch.length < 2) {
        setUsers([]);
        return;
      }
      setLoadingUsers(true);
      try {
        const response = await api.users.list({ search: userSearch, perPage: 10 });
        setUsers(response.users);
      } catch {
        toast.error('Failed to search users');
      } finally {
        setLoadingUsers(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [userSearch]);

  const handleSave = async () => {
    if (!selectedUserId || !selectedRoleId) {
      toast.error('Please select both a user and a role');
      return;
    }

    setSaving(true);
    try {
      await api.roleBindings.create({
        user_id: selectedUserId,
        role_id: selectedRoleId,
      });
      toast.success('Role binding created');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create binding');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Assign Role to User</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Search User</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setSelectedUserId(null);
              }}
              placeholder="Search by name or email..."
            />
            {loadingUsers && (
              <div className="mt-2">
                <span className="loading loading-spinner loading-sm" />
              </div>
            )}
            {!loadingUsers && users.length > 0 && !selectedUserId && (
              <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                {users.map((user) => (
                  <button
                    key={user.id}
                    className="w-full text-left px-3 py-2 hover:bg-base-200 border-b last:border-b-0"
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-base-content/60">{user.email}</div>
                  </button>
                ))}
              </div>
            )}
            {selectedUser && (
              <div className="mt-2 p-3 bg-primary/10 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-base-content/60">{selectedUser.email}</div>
                </div>
                <button
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={() => {
                    setSelectedUserId(null);
                    setUserSearch('');
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Role</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedRoleId || ''}
              onChange={(e) => setSelectedRoleId(Number(e.target.value) || null)}
            >
              <option value="">Select a role...</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} {role.description && `- ${role.description}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !selectedUserId || !selectedRoleId}
          >
            {saving ? <span className="loading loading-spinner loading-sm" /> : 'Assign Role'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

export function RolesPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'bindings'>('roles');

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesPagination, setRolesPagination] = useState<Pagination | null>(null);
  const [rolesPage, setRolesPage] = useState(1);
  const [rolesLoading, setRolesLoading] = useState(true);

  // Bindings state
  const [bindings, setBindings] = useState<RoleBinding[]>([]);
  const [bindingsPagination, setBindingsPagination] = useState<Pagination | null>(null);
  const [bindingsPage, setBindingsPage] = useState(1);
  const [bindingsLoading, setBindingsLoading] = useState(true);

  // Modals
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleModalMode, setRoleModalMode] = useState<'view' | 'edit' | 'create'>('view');

  const [bindingModalOpen, setBindingModalOpen] = useState(false);

  // Delete confirmation
  const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null);
  const [deleteBindingId, setDeleteBindingId] = useState<number | null>(null);

  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const response = await api.roles.list({ page: rolesPage, perPage: 20 });
      setRoles(response.roles);
      setRolesPagination(response.pagination);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setRolesLoading(false);
    }
  }, [rolesPage]);

  const loadBindings = useCallback(async () => {
    setBindingsLoading(true);
    try {
      const response = await api.roleBindings.list({ page: bindingsPage, perPage: 20 });
      setBindings(response.role_bindings);
      setBindingsPagination(response.pagination);
    } catch {
      toast.error('Failed to load role bindings');
    } finally {
      setBindingsLoading(false);
    }
  }, [bindingsPage]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    if (activeTab === 'bindings') {
      loadBindings();
    }
  }, [activeTab, loadBindings]);

  const openRoleModal = (role: Role | null, mode: 'view' | 'edit' | 'create') => {
    setSelectedRole(role);
    setRoleModalMode(mode);
    setRoleModalOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;
    try {
      await api.roles.delete(deleteRoleId);
      toast.success('Role deleted');
      loadRoles();
    } catch {
      toast.error('Failed to delete role');
    } finally {
      setDeleteRoleId(null);
    }
  };

  const handleDeleteBinding = async () => {
    if (!deleteBindingId) return;
    try {
      await api.roleBindings.delete(deleteBindingId);
      toast.success('Role binding deleted');
      loadBindings();
    } catch {
      toast.error('Failed to delete role binding');
    } finally {
      setDeleteBindingId(null);
    }
  };

  const rolesTotalPages = rolesPagination
    ? Math.ceil(rolesPagination.total / rolesPagination.per_page)
    : 1;
  const bindingsTotalPages = bindingsPagination
    ? Math.ceil(bindingsPagination.total / bindingsPagination.per_page)
    : 1;

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1 gap-2">
          <Link to="/admin" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold">Roles & Permissions</h1>
        </div>
        <div className="flex-none gap-2">
          {activeTab === 'roles' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => openRoleModal(null, 'create')}
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          )}
          {activeTab === 'bindings' && (
            <button className="btn btn-primary btn-sm" onClick={() => setBindingModalOpen(true)}>
              <UserPlus className="w-4 h-4" />
              Assign Role
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-7xl">
        {/* Tabs */}
        <div role="tablist" className="tabs tabs-boxed mb-4">
          <button
            role="tab"
            className={`tab gap-2 ${activeTab === 'roles' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <Shield className="w-4 h-4" />
            Roles
          </button>
          <button
            role="tab"
            className={`tab gap-2 ${activeTab === 'bindings' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('bindings')}
          >
            <Users className="w-4 h-4" />
            Role Bindings
          </button>
        </div>

        {/* Roles Table */}
        {activeTab === 'roles' && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-0">
              {rolesLoading ? (
                <div className="flex justify-center items-center py-20">
                  <span className="loading loading-spinner loading-lg" />
                </div>
              ) : roles.length === 0 ? (
                <div className="text-center py-20 text-base-content/60">No roles found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Permissions</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((role) => (
                        <tr key={role.id}>
                          <td className="font-mono text-sm">{role.id}</td>
                          <td>
                            <span className="badge badge-primary">{role.name}</span>
                          </td>
                          <td
                            className="max-w-[200px] truncate text-sm"
                            title={role.description || ''}
                          >
                            {role.description || '-'}
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions?.map((p) => (
                                <span key={p} className="badge badge-outline badge-sm">
                                  {p}
                                </span>
                              ))}
                              {(!role.permissions || role.permissions.length === 0) && (
                                <span className="text-base-content/40 text-sm">None</span>
                              )}
                            </div>
                          </td>
                          <td className="text-sm">{new Date(role.created_at).toLocaleString()}</td>
                          <td>
                            <div className="flex gap-1">
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => openRoleModal(role, 'view')}
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => openRoleModal(role, 'edit')}
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => setDeleteRoleId(role.id)}
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

              {/* Pagination */}
              {rolesPagination && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-base-content/60">
                    Showing {(rolesPagination.current_page - 1) * rolesPagination.per_page + 1} -{' '}
                    {Math.min(
                      rolesPagination.current_page * rolesPagination.per_page,
                      rolesPagination.total
                    )}{' '}
                    of {rolesPagination.total}
                  </div>
                  <div className="join">
                    <button
                      className="join-item btn btn-sm"
                      disabled={rolesPage <= 1}
                      onClick={() => setRolesPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="join-item btn btn-sm">
                      Page {rolesPage} of {rolesTotalPages}
                    </button>
                    <button
                      className="join-item btn btn-sm"
                      disabled={rolesPage >= rolesTotalPages}
                      onClick={() => setRolesPage((p) => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bindings Table */}
        {activeTab === 'bindings' && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-0">
              {bindingsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <span className="loading loading-spinner loading-lg" />
                </div>
              ) : bindings.length === 0 ? (
                <div className="text-center py-20 text-base-content/60">No role bindings found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bindings.map((binding) => (
                        <tr key={binding.id}>
                          <td className="font-mono text-sm">{binding.id}</td>
                          <td>
                            <div>
                              <div className="font-medium">{binding.user?.name}</div>
                              <div className="text-sm text-base-content/60">
                                {binding.user?.email}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-primary">{binding.role?.name}</span>
                          </td>
                          <td className="text-sm">
                            {new Date(binding.created_at).toLocaleString()}
                          </td>
                          <td>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => setDeleteBindingId(binding.id)}
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {bindingsPagination && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-base-content/60">
                    Showing{' '}
                    {(bindingsPagination.current_page - 1) * bindingsPagination.per_page + 1} -{' '}
                    {Math.min(
                      bindingsPagination.current_page * bindingsPagination.per_page,
                      bindingsPagination.total
                    )}{' '}
                    of {bindingsPagination.total}
                  </div>
                  <div className="join">
                    <button
                      className="join-item btn btn-sm"
                      disabled={bindingsPage <= 1}
                      onClick={() => setBindingsPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="join-item btn btn-sm">
                      Page {bindingsPage} of {bindingsTotalPages}
                    </button>
                    <button
                      className="join-item btn btn-sm"
                      disabled={bindingsPage >= bindingsTotalPages}
                      onClick={() => setBindingsPage((p) => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Role Modal */}
      <RoleModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        role={selectedRole}
        mode={roleModalMode}
        onSave={loadRoles}
      />

      {/* Role Binding Modal */}
      <RoleBindingModal
        isOpen={bindingModalOpen}
        onClose={() => setBindingModalOpen(false)}
        roles={roles}
        onSave={loadBindings}
      />

      {/* Delete Role Confirmation */}
      {deleteRoleId && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete this role? This will also remove all role bindings for
              this role.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setDeleteRoleId(null)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDeleteRole}>
                Delete
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setDeleteRoleId(null)}>close</button>
          </form>
        </dialog>
      )}

      {/* Delete Binding Confirmation */}
      {deleteBindingId && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Remove</h3>
            <p className="py-4">Are you sure you want to remove this role assignment?</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setDeleteBindingId(null)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleDeleteBinding}>
                Remove
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setDeleteBindingId(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
