import { useEffect, useState } from 'react';
import { Edit, Check } from 'lucide-react';
import { api } from '../lib/api';
import type { DashboardConfig, PanelConfig, ResponsiveSize } from '../lib/api';
import { DEFAULT_SIZES } from './PanelWrapper';
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
      panels: [
        ...config.panels,
        {
          panel: panelType,
          sm: DEFAULT_SIZES.sm,
          md: DEFAULT_SIZES.md,
          lg: DEFAULT_SIZES.lg,
        },
      ],
    };

    try {
      const response = await api.config.update(newConfig);
      setConfig(response.config);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update config');
    }
  };

  const updatePanelConfig = async (
    index: number,
    panelConfig: { sm: ResponsiveSize; md: ResponsiveSize; lg: ResponsiveSize }
  ) => {
    const newConfig: DashboardConfig = {
      ...config,
      panels: config.panels.map((panel, i) =>
        i === index
          ? {
              ...panel,
              sm: panelConfig.sm,
              md: panelConfig.md,
              lg: panelConfig.lg,
            }
          : panel
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

  const renderPanel = (panelConfig: PanelConfig, index: number) => {
    const handleRemove = editMode ? () => removePanel(index) : undefined;
    const handleConfigChange = editMode
      ? (config: { sm: ResponsiveSize; md: ResponsiveSize; lg: ResponsiveSize }) =>
          updatePanelConfig(index, config)
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
        sm={panelConfig.sm}
        md={panelConfig.md}
        lg={panelConfig.lg}
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

        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
          {config.panels.map((panel, index) => {
            const sm = panel.sm || DEFAULT_SIZES.sm;
            const md = panel.md || DEFAULT_SIZES.md;
            const lg = panel.lg || DEFAULT_SIZES.lg;

            const getWidthStyle = (size: ResponsiveSize, gapRem: number) => {
              if (size.widthMode === 'fixed') {
                return `${size.width}px`;
              }
              const percentage = (size.width / 24) * 100;
              return `calc(${percentage}% - ${gapRem}rem * ${(24 - size.width) / 24})`;
            };

            return (
              <div
                key={index}
                className="panel-width-wrapper"
                style={
                  {
                    '--width-sm': getWidthStyle(sm, 0.5),
                    '--width-md': getWidthStyle(md, 0.75),
                    '--width-lg': getWidthStyle(lg, 1),
                  } as React.CSSProperties
                }
              >
                {renderPanel(panel, index)}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
