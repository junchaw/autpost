import { useState, useEffect, useRef } from 'react';
import { X, Settings, Check } from 'lucide-react';

interface PanelWrapperProps {
  title: string;
  children: React.ReactNode;
  width?: number;
  onRemove?: () => void;
  onConfigChange?: (config: { width: number }) => void;
}

export function PanelWrapper({
  title,
  children,
  width = 8,
  onRemove,
  onConfigChange,
}: PanelWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempWidth, setTempWidth] = useState(width);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (confirmRemove) {
      const handleClickOutside = (event: MouseEvent) => {
        if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
          setConfirmRemove(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [confirmRemove]);

  const handleRemoveClick = () => {
    if (confirmRemove) {
      onRemove?.();
    } else {
      setConfirmRemove(true);
    }
  };

  const handleEdit = () => {
    setTempWidth(width);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    onConfigChange?.({ width: tempWidth });
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setTempWidth(width);
    setIsModalOpen(false);
  };

  return (
    <div className="group card relative bg-base-200 shadow-sm">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        {children}
      </div>
      {(onRemove || onConfigChange) && (
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-base-content/40 group-hover:bg-base-content/50 backdrop-blur-[2px] rounded-box flex items-center justify-center gap-2 pointer-events-none"
        >
          {onConfigChange && (
            <div className="tooltip" data-tip="Settings">
              <button onClick={handleEdit} className="btn btn-circle pointer-events-auto">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          )}
          {onRemove && (
            <div className="tooltip" data-tip={confirmRemove ? 'Confirm Remove' : 'Remove'}>
              <button
                onClick={handleRemoveClick}
                className={`btn btn-circle pointer-events-auto ${confirmRemove ? 'btn-error' : ''}`}
              >
                {confirmRemove ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Panel Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Panel Width (1-24 columns)</span>
                  <span className="label-text-alt">{tempWidth}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={tempWidth}
                  onChange={(e) => setTempWidth(Number(e.target.value))}
                  className="range range-primary w-full"
                  step="1"
                />
                <div className="w-full flex justify-between text-xs px-2 mt-2">
                  <span>1</span>
                  <span>6</span>
                  <span>12</span>
                  <span>18</span>
                  <span>24</span>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button onClick={handleCancel} className="btn">
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleCancel}></div>
        </dialog>
      )}
    </div>
  );
}
