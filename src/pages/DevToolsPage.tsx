import { ArrowLeft, List, Play, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { RecurringTodoModal } from '../components/panels/TodoPanel/RecurringTodoModal';
import { Select } from '../components/ui/Select';
import { api } from '../lib/api';

const TIME_AHEAD_OPTIONS = [
  { value: '1h', label: '1 hour' },
  { value: '6h', label: '6 hours' },
  { value: '12h', label: '12 hours' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
];

export function DevToolsPage() {
  const [generating, setGenerating] = useState(false);
  const [timeAhead, setTimeAhead] = useState('1h');
  const [showRecurringModal, setShowRecurringModal] = useState(false);

  const handleGenerateRecurringTodos = async () => {
    setGenerating(true);
    try {
      const response = await api.recurringTodos.generate(timeAhead);
      toast.success(response.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate recurring todos');
    } finally {
      setGenerating(false);
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
          <h1 className="text-xl font-bold">Dev Tools</h1>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">
              <RefreshCw className="w-5 h-5" />
              Generate Recurring Todos
            </h2>
            <p className="text-sm text-base-content/60">
              Manually trigger the generation of todos from recurring todos. This is normally run
              automatically every hour.
            </p>

            <div className="flex items-end gap-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Time Ahead</span>
                </label>
                <Select
                  value={timeAhead}
                  onChange={setTimeAhead}
                  options={TIME_AHEAD_OPTIONS}
                  className="select-sm"
                />
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={handleGenerateRecurringTodos}
                disabled={generating}
              >
                {generating ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Generate
              </button>

              <button className="btn btn-ghost btn-sm" onClick={() => setShowRecurringModal(true)}>
                <List className="w-4 h-4" />
                Recurring Todos
              </button>
            </div>
          </div>
        </div>
      </div>

      <RecurringTodoModal
        isOpen={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
      />
    </div>
  );
}
