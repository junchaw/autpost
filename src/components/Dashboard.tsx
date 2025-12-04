import { useEffect, useState } from 'react';
import { Edit, Check } from 'lucide-react';
import { api } from '../lib/api';
import type { DashboardConfig } from '../lib/api';
import { Base64EncodeDecodePanel } from './panels/Base64EncodeDecodePanel';
import { Base64SimultaneousPanel } from './panels/Base64SimultaneousPanel';
import { URLEncodeDecodePanel } from './panels/URLEncodeDecodePanel';
import { URLSimultaneousPanel } from './panels/URLSimultaneousPanel';
import { URLParserPanel } from './panels/URLParserPanel';
import { JWTParserPanel } from './panels/JWTParserPanel';
import { CertificateParserPanel } from './panels/CertificateParserPanel';
import { TextUniquePanel } from './panels/TextUniquePanel';
import { FindTextDuplicationPanel } from './panels/FindTextDuplicationPanel';
import { TextSortPanel } from './panels/TextSortPanel';
import { TextDiffPanel } from './panels/TextDiffPanel';
import { DateFormatPanel } from './panels/DateFormatPanel';
import { TimestampParserPanel } from './panels/TimestampParserPanel';
import { QRCodePanel } from './panels/QRCodePanel';
import { AddPanelDialog } from './AddPanelDialog';
import { Banner } from './Banner';
import { PanelWrapper } from './PanelWrapper';

// Helper function to get the col-span class based on width
const getColSpanClass = (width: number): string => {
  const classes: Record<number, string> = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
    13: 'col-span-13',
    14: 'col-span-14',
    15: 'col-span-15',
    16: 'col-span-16',
    17: 'col-span-17',
    18: 'col-span-18',
    19: 'col-span-19',
    20: 'col-span-20',
    21: 'col-span-21',
    22: 'col-span-22',
    23: 'col-span-23',
    24: 'col-span-24',
  };
  return classes[width] || 'col-span-8';
};

export function Dashboard() {
  const [config, setConfig] = useState<DashboardConfig>({ panels: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await api.config.get();
      setConfig(response.config);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load config');
    } finally {
      setLoading(false);
    }
  };

  const addPanel = async (panelType: string) => {
    const newConfig: DashboardConfig = {
      ...config,
      panels: [...config.panels, { panel: panelType, width: 8 }],
    };

    try {
      const response = await api.config.update(newConfig);
      setConfig(response.config);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update config');
    }
  };

  const updatePanelConfig = async (index: number, panelConfig: { width: number }) => {
    const newConfig: DashboardConfig = {
      ...config,
      panels: config.panels.map((panel, i) =>
        i === index ? { ...panel, width: panelConfig.width } : panel
      ),
    };

    try {
      const response = await api.config.update(newConfig);
      setConfig(response.config);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update config');
    }
  };

  const removePanel = async (index: number) => {
    const newConfig: DashboardConfig = {
      ...config,
      panels: config.panels.filter((_, i) => i !== index),
    };

    try {
      const response = await api.config.update(newConfig);
      setConfig(response.config);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update config');
    }
  };

  const getPanelTitle = (panelType: string): string => {
    switch (panelType) {
      case 'base64-encode-decode':
        return 'Base64 Encoder/Decoder';
      case 'base64-simultaneous':
        return 'Base64 Encode/Decode Simultaneously';
      case 'url-encode-decode':
        return 'URL Encoder/Decoder';
      case 'url-simultaneous':
        return 'URL Encode/Decode Simultaneously';
      case 'url-parser':
        return 'URL Parser';
      case 'jwt-parser':
        return 'JWT Parser';
      case 'certificate-parser':
        return 'Certificate Parser';
      case 'timestamp-parser':
        return 'Timestamp Parser';
      case 'date-format':
        return 'Date Format';
      case 'qr-code':
        return 'QR Code Generator';
      case 'text-diff':
        return 'Text Diff';
      case 'text-unique':
        return 'Text Unique';
      case 'text-sort':
        return 'Text Sort';
      case 'text-duplication':
        return 'Find Text Duplication';
      default:
        return 'Unknown Panel';
    }
  };

  const renderPanel = (panelConfig: { panel: string; width?: number }, index: number) => {
    const handleRemove = editMode ? () => removePanel(index) : undefined;
    const handleConfigChange = editMode
      ? (config: { width: number }) => updatePanelConfig(index, config)
      : undefined;

    let panel;
    switch (panelConfig.panel) {
      case 'base64-encode-decode':
        panel = <Base64EncodeDecodePanel />;
        break;
      case 'base64-simultaneous':
        panel = <Base64SimultaneousPanel />;
        break;
      case 'url-encode-decode':
        panel = <URLEncodeDecodePanel />;
        break;
      case 'url-simultaneous':
        panel = <URLSimultaneousPanel />;
        break;
      case 'url-parser':
        panel = <URLParserPanel />;
        break;
      case 'jwt-parser':
        panel = <JWTParserPanel />;
        break;
      case 'certificate-parser':
        panel = <CertificateParserPanel />;
        break;
      case 'text-unique':
        panel = <TextUniquePanel />;
        break;
      case 'text-duplication':
        panel = <FindTextDuplicationPanel />;
        break;
      case 'text-sort':
        panel = <TextSortPanel />;
        break;
      case 'text-diff':
        panel = <TextDiffPanel />;
        break;
      case 'date-format':
        panel = <DateFormatPanel />;
        break;
      case 'timestamp-parser':
        panel = <TimestampParserPanel />;
        break;
      case 'qr-code':
        panel = <QRCodePanel />;
        break;
      default:
        panel = (
          <div className="card bg-base-100 shadow-xl h-full">
            <div className="card-body">
              <h2 className="card-title text-error">Unknown Panel</h2>
              <div className="alert alert-error">
                <span>Unknown panel type: {panelConfig.panel}</span>
              </div>
            </div>
          </div>
        );
    }

    return (
      <PanelWrapper
        key={index}
        title={getPanelTitle(panelConfig.panel)}
        width={panelConfig.width || 8}
        onRemove={handleRemove}
        onConfigChange={handleConfigChange}
      >
        {panel}
      </PanelWrapper>
    );
  };

  if (loading) {
    return (
      <>
        <Banner />
        <div className="flex items-center justify-center min-h-screen">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <Banner />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Tools</h2>
          <div className="flex gap-2">
            {editMode && <AddPanelDialog onAddPanel={addPanel} />}
            <button
              onClick={() => setEditMode(!editMode)}
              className={`btn btn-sm gap-2 ${editMode ? 'btn-primary' : ''}`}
            >
              {editMode ? (
                <>
                  <Check className="h-4 w-4" />
                  Done
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Edit
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] rounded mb-5">
            {error}
          </div>
        )}

        <div className="grid grid-cols-24 gap-6">
          {config.panels.map((panel, index) => {
            const width = panel.width || 8;
            return (
              <div key={index} className={getColSpanClass(width)}>
                {renderPanel(panel, index)}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
