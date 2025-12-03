import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api';
import type { DashboardConfig } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EncodeDecodePanel } from './EncodeDecodePanel';
import { Base64SimultaneousPanel } from './Base64SimultaneousPanel';
import { URLEncodeDecodePanel } from './URLEncodeDecodePanel';
import { URLSimultaneousPanel } from './URLSimultaneousPanel';
import { URLParserPanel } from './URLParserPanel';
import { JWTParserPanel } from './JWTParserPanel';
import { CertificateParserPanel } from './CertificateParserPanel';
import { TextUniquePanel } from './TextUniquePanel';
import { FindTextDuplicationPanel } from './FindTextDuplicationPanel';
import { TextSortPanel } from './TextSortPanel';
import { TextDiffPanel } from './TextDiffPanel';
import { DateFormatPanel } from './DateFormatPanel';
import { TimestampParserPanel } from './TimestampParserPanel';
import { AddPanelDialog } from './AddPanelDialog';
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
      case 'base64-encode-decode':
        return <EncodeDecodePanel key={index} onRemove={handleRemove} />;
      case 'base64-simultaneous':
        return <Base64SimultaneousPanel key={index} onRemove={handleRemove} />;
      case 'url-encode-decode':
        return <URLEncodeDecodePanel key={index} onRemove={handleRemove} />;
      case 'url-simultaneous':
        return <URLSimultaneousPanel key={index} onRemove={handleRemove} />;
      case 'url-parser':
        return <URLParserPanel key={index} onRemove={handleRemove} />;
      case 'jwt-parser':
        return <JWTParserPanel key={index} onRemove={handleRemove} />;
      case 'certificate-parser':
        return <CertificateParserPanel key={index} onRemove={handleRemove} />;
      case 'text-unique':
        return <TextUniquePanel key={index} onRemove={handleRemove} />;
      case 'text-duplication':
        return <FindTextDuplicationPanel key={index} onRemove={handleRemove} />;
      case 'text-sort':
        return <TextSortPanel key={index} onRemove={handleRemove} />;
      case 'text-diff':
        return <TextDiffPanel key={index} onRemove={handleRemove} />;
      case 'date-format':
        return <DateFormatPanel key={index} onRemove={handleRemove} />;
      case 'timestamp-parser':
        return <TimestampParserPanel key={index} onRemove={handleRemove} />;
      default:
        return (
          <Card key={index} className="transition-all hover:shadow-lg h-full">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[hsl(var(--destructive))]"></div>
                  <CardTitle className="text-lg">Unknown Panel</CardTitle>
                </div>
                <Button
                  onClick={handleRemove}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive-foreground))]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-red-600 dark:text-red-400">
                Unknown panel type: {panelConfig.panel}
              </div>
            </CardContent>
          </Card>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Tools</h2>
          <AddPanelDialog onAddPanel={addPanel} />
        </div>

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
        </div>
      </div>
    </>
  );
}
