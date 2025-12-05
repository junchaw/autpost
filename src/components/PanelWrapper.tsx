import { useState, useEffect, useRef, useId, useCallback } from 'react';
import { X, Settings, Check } from 'lucide-react';
import type { WidthMode, ScreenSize, ResponsiveSize } from '../lib/api';
import { DEFAULT_SIZES, SCREEN_SIZE_LABELS } from './panelConstants';

interface PanelWrapperProps {
  title: string;
  children: React.ReactNode;
  sm?: ResponsiveSize;
  md?: ResponsiveSize;
  lg?: ResponsiveSize;
  onRemove?: () => void;
  onConfigChange?: (config: { sm: ResponsiveSize; md: ResponsiveSize; lg: ResponsiveSize }) => void;
}

export function PanelWrapper({
  title,
  children,
  sm = DEFAULT_SIZES.sm,
  md = DEFAULT_SIZES.md,
  lg = DEFAULT_SIZES.lg,
  onRemove,
  onConfigChange,
}: PanelWrapperProps) {
  const panelId = useId().replace(/:/g, '-');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSizes, setTempSizes] = useState<Record<ScreenSize, ResponsiveSize>>({ sm, md, lg });
  const [confirmRemove, setConfirmRemove] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

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

  // Dialog open/close effect
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isModalOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isModalOpen]);

  const handleModalClose = useCallback(() => {
    setTempSizes({ sm, md, lg });
    setIsModalOpen(false);
  }, [sm, md, lg]);

  // Handle native dialog close (e.g., Escape key)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.addEventListener('close', handleModalClose);
    return () => dialog.removeEventListener('close', handleModalClose);
  }, [handleModalClose]);

  const handleRemoveClick = () => {
    if (confirmRemove) {
      onRemove?.();
    } else {
      setConfirmRemove(true);
    }
  };

  const handleEdit = () => {
    setTempSizes({ sm, md, lg });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    onConfigChange?.(tempSizes);
    setIsModalOpen(false);
  };

  const updateTempSize = (screen: ScreenSize, updates: Partial<ResponsiveSize>) => {
    setTempSizes((prev) => ({
      ...prev,
      [screen]: { ...prev[screen], ...updates },
    }));
  };

  const handleWidthModeToggle = (screen: ScreenSize) => {
    const current = tempSizes[screen];
    const newMode: WidthMode = current.widthMode === 'column' ? 'fixed' : 'column';
    updateTempSize(screen, {
      widthMode: newMode,
      width: newMode === 'column' ? 12 : 400,
    });
  };

  const panelClass = `panel-${panelId}`;

  return (
    <div
      className={`group card-xs sm:card-sm md:card relative bg-base-200 shadow-sm ${panelClass}`}
    >
      <style>{`
        .${panelClass} { height: ${sm.height}px; }
        @media (min-width: 768px) { .${panelClass} { height: ${md.height}px; } }
        @media (min-width: 1024px) { .${panelClass} { height: ${lg.height}px; } }
      `}</style>
      <div className="card-body flex flex-col overflow-hidden">
        <h2 className="card-title shrink-0">{title}</h2>
        <div className="flex-1 overflow-auto">{children}</div>
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
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Panel Settings</h3>

          <div className="space-y-6">
            {(['sm', 'md', 'lg'] as ScreenSize[]).map((size) => {
              const sizeConfig = tempSizes[size];
              return (
                <div key={size} className="border border-base-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{SCREEN_SIZE_LABELS[size]}</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm text-base-content/70">Column</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-sm"
                        checked={sizeConfig.widthMode === 'fixed'}
                        onChange={() => handleWidthModeToggle(size)}
                      />
                      <span className="text-sm text-base-content/70">Fixed</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label py-1">
                        <span className="label-text text-xs">
                          Width {sizeConfig.widthMode === 'column' ? '(columns)' : '(px)'}
                        </span>
                        <span className="label-text-alt text-xs">
                          {sizeConfig.width}
                          {sizeConfig.widthMode === 'column' ? '/24 cols' : 'px'}
                        </span>
                      </label>
                      <input
                        type="range"
                        min={sizeConfig.widthMode === 'column' ? 1 : 100}
                        max={sizeConfig.widthMode === 'column' ? 24 : 900}
                        value={sizeConfig.width}
                        onChange={(e) => updateTempSize(size, { width: Number(e.target.value) })}
                        className="range range-primary range-xs w-full"
                        step={sizeConfig.widthMode === 'column' ? 1 : 50}
                      />
                    </div>

                    <div>
                      <label className="label py-1">
                        <span className="label-text text-xs">Height (px)</span>
                        <span className="label-text-alt text-xs">{sizeConfig.height}px</span>
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="900"
                        value={sizeConfig.height}
                        onChange={(e) => updateTempSize(size, { height: Number(e.target.value) })}
                        className="range range-primary range-xs w-full"
                        step="50"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="modal-action">
            <button onClick={handleModalClose} className="btn">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              Save
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
