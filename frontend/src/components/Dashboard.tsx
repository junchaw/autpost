import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { DashboardConfig } from '../lib/api';
import { EncodePanel } from './EncodePanel';
import { DecodePanel } from './DecodePanel';
import { EncodeDecodePanel } from './EncodeDecodePanel';
import { AddPanelCard } from './AddPanelCard';
import { Banner } from './Banner';

export function Dashboard() {
  const [config, setConfig] = useState<DashboardConfig>({ panels: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

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
      panels: [...config.panels, { panel: panelType }],
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

  const renderPanel = (panelConfig: { panel: string }, index: number) => {
    const handleRemove = () => removePanel(index);

    switch (panelConfig.panel) {
      case 'base64-encode':
        return <EncodePanel key={index} onRemove={handleRemove} />;
      case 'base64-decode':
        return <DecodePanel key={index} onRemove={handleRemove} />;
      case 'base64-encode-decode':
        return <EncodeDecodePanel key={index} onRemove={handleRemove} />;
      default:
        return (
          <div key={index} className="p-5 border border-red-500 rounded mb-5">
            Unknown panel type: {panelConfig.panel}
          </div>
        );
    }
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
        <h2 className="text-3xl font-bold mb-6">Tools</h2>

        {error && (
          <div className="p-3 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] rounded mb-5">
            {error}
          </div>
        )}

        <div className="grid grid-cols-24 gap-6">
          {config.panels.map((panel, index) => (
            <div key={index} className="col-span-24 md:col-span-12 lg:col-span-8">
              {renderPanel(panel, index)}
            </div>
          ))}
          <div className="col-span-24 md:col-span-12 lg:col-span-8">
            <AddPanelCard onAddPanel={addPanel} />
          </div>
        </div>
      </div>
    </>
  );
}
