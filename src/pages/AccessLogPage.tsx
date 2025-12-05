import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api, type AccessLog, type Pagination } from '../lib/api';

interface AccessLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessLog: AccessLog | null;
  mode: 'view' | 'edit' | 'create';
  onSave: () => void;
}

function AccessLogModal({ isOpen, onClose, accessLog, mode, onSave }: AccessLogModalProps) {
  const [formData, setFormData] = useState({
    source: '',
    path: '',
    ip: '',
    user_agent: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && accessLog && mode !== 'create') {
      setFormData({
        source: accessLog.source,
        path: accessLog.path,
        ip: accessLog.ip,
        user_agent: accessLog.user_agent,
      });
    } else if (mode === 'create') {
      setFormData({ source: '', path: '', ip: '', user_agent: '' });
    }
    setErrors({});
  }, [isOpen, accessLog, mode]);

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.source.trim()) newErrors.source = 'Source is required';
    if (!formData.path.trim()) newErrors.path = 'Path is required';
    if (!formData.ip.trim()) newErrors.ip = 'IP is required';
    if (!formData.user_agent.trim()) newErrors.user_agent = 'User agent is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      if (mode === 'create') {
        await api.accessLogs.create(formData);
        toast.success('Access log created');
      } else if (mode === 'edit' && accessLog) {
        await api.accessLogs.update(accessLog.id, formData);
        toast.success('Access log updated');
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
      ? 'Create Access Log'
      : mode === 'edit'
        ? 'Edit Access Log'
        : 'View Access Log';

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Source</span>
            </label>
            <input
              type="text"
              className={`input input-bordered ${errors.source ? 'input-error' : ''}`}
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              readOnly={isReadOnly}
              placeholder="e.g., web, api, mobile"
            />
            {errors.source && <span className="text-error text-sm mt-1">{errors.source}</span>}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Path</span>
            </label>
            <input
              type="text"
              className={`input input-bordered ${errors.path ? 'input-error' : ''}`}
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              readOnly={isReadOnly}
              placeholder="e.g., /api/users"
            />
            {errors.path && <span className="text-error text-sm mt-1">{errors.path}</span>}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">IP Address</span>
            </label>
            <input
              type="text"
              className={`input input-bordered ${errors.ip ? 'input-error' : ''}`}
              value={formData.ip}
              onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
              readOnly={isReadOnly}
              placeholder="e.g., 192.168.1.1"
            />
            {errors.ip && <span className="text-error text-sm mt-1">{errors.ip}</span>}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">User Agent</span>
            </label>
            <textarea
              className={`textarea textarea-bordered h-24 ${errors.user_agent ? 'textarea-error' : ''}`}
              value={formData.user_agent}
              onChange={(e) => setFormData({ ...formData, user_agent: e.target.value })}
              readOnly={isReadOnly}
              placeholder="e.g., Mozilla/5.0..."
            />
            {errors.user_agent && (
              <span className="text-error text-sm mt-1">{errors.user_agent}</span>
            )}
          </div>

          {accessLog && mode === 'view' && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <span className="text-sm text-base-content/60">Created</span>
                <p className="font-mono text-sm">
                  {new Date(accessLog.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-base-content/60">Updated</span>
                <p className="font-mono text-sm">
                  {new Date(accessLog.updated_at).toLocaleString()}
                </p>
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

export function AccessLogPage() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);

  // Filters
  const [sourceFilter, setSourceFilter] = useState('');
  const [pathFilter, setPathFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.accessLogs.list({
        page: currentPage,
        perPage,
        source: sourceFilter || undefined,
        path: pathFilter || undefined,
        ip: ipFilter || undefined,
      });
      setLogs(response.access_logs);
      setPagination(response.pagination);
    } catch {
      toast.error('Failed to load access logs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, sourceFilter, pathFilter, ipFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadLogs();
  };

  const handleClearFilters = () => {
    setSourceFilter('');
    setPathFilter('');
    setIpFilter('');
    setCurrentPage(1);
  };

  const openModal = (log: AccessLog | null, mode: 'view' | 'edit' | 'create') => {
    setSelectedLog(log);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.accessLogs.delete(deleteId);
      toast.success('Access log deleted');
      loadLogs();
    } catch {
      toast.error('Failed to delete access log');
    } finally {
      setDeleteId(null);
    }
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.per_page) : 1;

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1 gap-2">
          <Link to="/admin" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold">Access Logs</h1>
        </div>
        <div className="flex-none">
          <button className="btn btn-primary btn-sm" onClick={() => openModal(null, 'create')}>
            <Plus className="w-4 h-4" />
            Add Log
          </button>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-7xl">
        {/* Filters */}
        <div className="card bg-base-100 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="form-control flex-1 min-w-[150px]">
                <label className="label py-1">
                  <span className="label-text text-sm">Source</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  placeholder="Filter by source..."
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="form-control flex-1 min-w-[150px]">
                <label className="label py-1">
                  <span className="label-text text-sm">Path</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  placeholder="Filter by path..."
                  value={pathFilter}
                  onChange={(e) => setPathFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="form-control flex-1 min-w-[150px]">
                <label className="label py-1">
                  <span className="label-text text-sm">IP</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  placeholder="Filter by IP..."
                  value={ipFilter}
                  onChange={(e) => setIpFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                  Search
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleClearFilters}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-20 text-base-content/60">No access logs found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Source</th>
                      <th>Path</th>
                      <th>IP</th>
                      <th>User Agent</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="font-mono text-sm">{log.id}</td>
                        <td>
                          <span className="badge badge-outline">{log.source}</span>
                        </td>
                        <td className="font-mono text-sm max-w-[200px] truncate" title={log.path}>
                          {log.path}
                        </td>
                        <td className="font-mono text-sm">{log.ip}</td>
                        <td className="max-w-[200px] truncate text-sm" title={log.user_agent}>
                          {log.user_agent}
                        </td>
                        <td className="text-sm">{new Date(log.created_at).toLocaleString()}</td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => openModal(log, 'view')}
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => openModal(log, 'edit')}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => setDeleteId(log.id)}
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
            {pagination && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-base-content/60">
                  Showing {(pagination.current_page - 1) * pagination.per_page + 1} -{' '}
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                  {pagination.total}
                </div>
                <div className="join">
                  <button
                    className="join-item btn btn-sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="join-item btn btn-sm">
                    Page {currentPage} of {totalPages}
                  </button>
                  <button
                    className="join-item btn btn-sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AccessLogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        accessLog={selectedLog}
        mode={modalMode}
        onSave={loadLogs}
      />

      {/* Delete Confirmation */}
      {deleteId && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete this access log? This action cannot be undone.
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
