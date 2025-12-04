import { useState } from 'react';
import { Plus, Search } from 'lucide-react';

interface AddPanelDialogProps {
  onAddPanel: (panelType: string) => void;
}

interface PanelOption {
  id: string;
  name: string;
  description: string;
  category: string;
}

const PANEL_OPTIONS: PanelOption[] = [
  {
    id: 'base64-encode-decode',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode or decode Base64 strings',
    category: 'Base64',
  },
  {
    id: 'base64-simultaneous',
    name: 'Base64 Simultaneous',
    description: 'Encode and decode Base64 at the same time',
    category: 'Base64',
  },
  {
    id: 'url-encode-decode',
    name: 'URL Encoder/Decoder',
    description: 'Encode or decode URL strings',
    category: 'URL',
  },
  {
    id: 'url-simultaneous',
    name: 'URL Simultaneous',
    description: 'Encode and decode URLs at the same time',
    category: 'URL',
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description: 'Parse and analyze URL components',
    category: 'Parser',
  },
  {
    id: 'jwt-parser',
    name: 'JWT Parser',
    description: 'Decode and inspect JWT tokens',
    category: 'Parser',
  },
  {
    id: 'certificate-parser',
    name: 'Certificate Parser',
    description: 'Parse SSL/TLS certificates',
    category: 'Parser',
  },
  {
    id: 'text-unique',
    name: 'Text Unique',
    description: 'Remove duplicate lines from text',
    category: 'Text',
  },
  {
    id: 'text-duplication',
    name: 'Find Text Duplication',
    description: 'Find and count duplicate lines',
    category: 'Text',
  },
  {
    id: 'text-sort',
    name: 'Text Sort',
    description: 'Sort text lines alphabetically',
    category: 'Text',
  },
  { id: 'text-diff', name: 'Text Diff', description: 'Compare two text blocks', category: 'Text' },
  {
    id: 'date-format',
    name: 'Date Format',
    description: 'Format dates in multiple languages',
    category: 'Date & Time',
  },
  {
    id: 'timestamp-parser',
    name: 'Timestamp Parser',
    description: 'Parse Unix timestamps',
    category: 'Date & Time',
  },
  {
    id: 'qr-code',
    name: 'QR Code Generator',
    description: 'Generate QR codes',
    category: 'Generator',
  },
];

export function AddPanelDialog({ onAddPanel }: AddPanelDialogProps) {
  const [search, setSearch] = useState('');

  const handlePanelSelect = (panelType: string) => {
    onAddPanel(panelType);
    const modal = document.getElementById('add-panel-modal') as HTMLDialogElement;
    if (modal) {
      modal.close();
      setSearch(''); // Clear search on close
    }
  };

  const filteredPanels = PANEL_OPTIONS.filter(
    (panel) =>
      panel.name.toLowerCase().includes(search.toLowerCase()) ||
      panel.description.toLowerCase().includes(search.toLowerCase()) ||
      panel.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <button
        className="btn btn-sm gap-2"
        onClick={() =>
          (document.getElementById('add-panel-modal') as HTMLDialogElement)?.showModal()
        }
      >
        <Plus className="h-4 w-4" />
        Add Panel
      </button>

      <dialog id="add-panel-modal" className="modal">
        <div className="modal-box max-w-4xl">
          <h3 className="text-lg font-bold mb-2">Add Panel</h3>
          <p className="text-sm text-base-content/60 mb-4">
            Select a tool panel to add to your dashboard
          </p>

          <label className="input mb-4 flex items-center gap-2 w-full">
            <Search className="h-[1.25em] w-[1.25em] opacity-50 mr-2" />
            <input
              type="search"
              className="grow input focus:outline-none border-0 shadow-none bg-transparent w-full"
              placeholder="Search panels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {filteredPanels.map((panel) => (
              <div
                key={panel.id}
                className="card bg-base-100 shadow-md cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => handlePanelSelect(panel.id)}
              >
                <div className="card-body p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="card-title text-sm">{panel.name}</h3>
                    <span className="badge badge-sm badge-primary">{panel.category}</span>
                  </div>
                  <p className="text-xs text-base-content/60">{panel.description}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredPanels.length === 0 && (
            <div className="text-center py-8 text-base-content/60">
              No panels found matching "{search}"
            </div>
          )}

          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
