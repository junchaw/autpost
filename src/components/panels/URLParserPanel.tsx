import { useState, useEffect } from 'react';

interface ParsedURL {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  searchParams: Array<{ key: string; value: string }>;
  hash: string;
  origin: string;
  href: string;
}

export function URLParserPanel() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedURL | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!input) {
      setParsed(null);
      setError('');
      return;
    }

    try {
      const url = new URL(input);
      const params: Array<{ key: string; value: string }> = [];
      url.searchParams.forEach((value, key) => {
        params.push({ key, value });
      });

      setParsed({
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        searchParams: params,
        hash: url.hash,
        origin: url.origin,
        href: url.href,
      });
      setError('');
    } catch (err) {
      setParsed(null);
      setError(err instanceof Error ? err.message : 'Invalid URL');
    }
  }, [input]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <label className="label" htmlFor="url-parser-input">
          <span className="label-text font-medium">URL Input</span>
        </label>
        <textarea
          id="url-parser-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter URL to parse (e.g., https://example.com/path?key=value#hash)"
          rows={8}
          className="textarea textarea-bordered w-full resize-none font-mono"
        />
      </div>
      <div className="space-y-3">
        <label className="label">
          <span className="label-text font-medium">Parsed Components</span>
        </label>
        <div className="min-h-[200px] overflow-y-auto border rounded-md bg-[hsl(var(--muted))] p-4">
          {error ? (
            <div className="text-red-600 dark:text-red-400 font-medium">{error}</div>
          ) : parsed ? (
            <div className="space-y-4">
              <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">
                  Basic Info
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[hsl(var(--muted-foreground))]">
                      Protocol
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-mono text-base">
                      {parsed.protocol}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[hsl(var(--muted-foreground))]">Host</span>
                    <span className="text-green-600 dark:text-green-400 font-mono text-base">
                      {parsed.hostname}
                    </span>
                  </div>
                  {parsed.port && (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[hsl(var(--muted-foreground))]">Port</span>
                      <span className="text-green-600 dark:text-green-400 font-mono text-base">
                        {parsed.port}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[hsl(var(--muted-foreground))]">Path</span>
                    <span className="text-green-600 dark:text-green-400 font-mono text-base break-all">
                      {parsed.pathname}
                    </span>
                  </div>
                </div>
              </div>

              {parsed.searchParams.length > 0 && (
                <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                  <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">
                    Query Parameters
                  </div>
                  <div className="space-y-2 text-sm">
                    {parsed.searchParams.map((param, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">
                          {param.key}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono text-base break-all">
                          {param.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsed.hash && (
                <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                  <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">
                    Fragment
                  </div>
                  <div className="text-purple-600 dark:text-purple-400 font-mono text-base break-all">
                    {parsed.hash}
                  </div>
                </div>
              )}

              <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">
                  Complete URLs
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[hsl(var(--muted-foreground))]">Origin</span>
                    <span className="text-orange-600 dark:text-orange-400 font-mono text-base break-all">
                      {parsed.origin}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[hsl(var(--muted-foreground))]">
                      Full URL
                    </span>
                    <span className="text-orange-600 dark:text-orange-400 font-mono text-base break-all">
                      {parsed.href}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[hsl(var(--muted-foreground))] text-sm">
              Enter a URL to parse...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
