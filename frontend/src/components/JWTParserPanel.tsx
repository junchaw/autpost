import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface JWTParserPanelProps {
  onRemove: () => void;
}

interface ParsedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  timestamps?: {
    iat?: string;
    exp?: string;
    nbf?: string;
    status?: 'VALID' | 'EXPIRED';
  };
}

export function JWTParserPanel({ onRemove }: JWTParserPanelProps) {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedJWT | null>(null);
  const [error, setError] = useState<string>('');

  const base64UrlDecode = (str: string): string => {
    // Convert base64url to base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
    return atob(base64);
  };

  useEffect(() => {
    if (!input) {
      setParsed(null);
      setError('');
      return;
    }

    try {
      const parts = input.trim().split('.');

      if (parts.length !== 3) {
        setError('Invalid JWT format. JWT should have 3 parts separated by dots.');
        setParsed(null);
        return;
      }

      const [headerB64, payloadB64, signatureB64] = parts;

      // Decode header
      const headerJson = base64UrlDecode(headerB64);
      const header = JSON.parse(headerJson);

      // Decode payload
      const payloadJson = base64UrlDecode(payloadB64);
      const payload = JSON.parse(payloadJson);

      // Parse timestamps
      const timestamps: ParsedJWT['timestamps'] = {};
      if (payload.iat) {
        timestamps.iat = new Date(payload.iat * 1000).toISOString();
      }
      if (payload.exp) {
        timestamps.exp = new Date(payload.exp * 1000).toISOString();
        const now = Date.now();
        const expTime = payload.exp * 1000;
        timestamps.status = expTime < now ? 'EXPIRED' : 'VALID';
      }
      if (payload.nbf) {
        timestamps.nbf = new Date(payload.nbf * 1000).toISOString();
      }

      setParsed({
        header,
        payload,
        signature: signatureB64,
        timestamps: Object.keys(timestamps).length > 0 ? timestamps : undefined,
      });
      setError('');
    } catch (err) {
      setParsed(null);
      setError(err instanceof Error ? err.message : 'Invalid JWT token');
    }
  }, [input]);

  return (
    <Card className="transition-all hover:shadow-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></div>
            <CardTitle className="text-lg">JWT Parser</CardTitle>
          </div>
          <Button
            onClick={onRemove}
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive-foreground))]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="jwt-parser-input" className="text-sm font-medium">JWT Token Input</Label>
            <Textarea
              id="jwt-parser-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter JWT token to parse..."
              rows={8}
              className="resize-none transition-colors focus-visible:ring-2 font-mono text-sm"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Decoded JWT</Label>
            <div className="min-h-[200px] overflow-y-auto border rounded-md bg-[hsl(var(--muted))] p-4">
              {error ? (
                <div className="text-red-600 dark:text-red-400 font-medium">{error}</div>
              ) : parsed ? (
                <div className="space-y-4">
                  <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                    <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">Header</div>
                    <div className="space-y-2 text-sm">
                      {Object.entries(parsed.header).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <span className="font-medium text-[hsl(var(--muted-foreground))]">{key}</span>
                          <span className="text-green-600 dark:text-green-400 font-mono text-base">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                    <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">Payload</div>
                    <div className="space-y-2 text-sm">
                      {Object.entries(parsed.payload).map(([key, value]) => {
                        // Skip timestamp fields as they're shown separately
                        if (['iat', 'exp', 'nbf'].includes(key)) return null;
                        return (
                          <div key={key} className="flex flex-col gap-1">
                            <span className="font-medium text-[hsl(var(--muted-foreground))]">{key}</span>
                            <span className="text-blue-600 dark:text-blue-400 font-mono text-base break-all">
                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {parsed.timestamps && (
                    <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                      <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">Timestamps</div>
                      <div className="space-y-2 text-sm">
                        {parsed.timestamps.iat && (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-[hsl(var(--muted-foreground))]">Issued At (iat)</span>
                            <span className="text-purple-600 dark:text-purple-400 font-mono text-base">{parsed.timestamps.iat}</span>
                          </div>
                        )}
                        {parsed.timestamps.exp && (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-[hsl(var(--muted-foreground))]">Expires At (exp)</span>
                            <span className="text-purple-600 dark:text-purple-400 font-mono text-base">{parsed.timestamps.exp}</span>
                          </div>
                        )}
                        {parsed.timestamps.nbf && (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-[hsl(var(--muted-foreground))]">Not Before (nbf)</span>
                            <span className="text-purple-600 dark:text-purple-400 font-mono text-base">{parsed.timestamps.nbf}</span>
                          </div>
                        )}
                        {parsed.timestamps.status && (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-[hsl(var(--muted-foreground))]">Status</span>
                            <span className={`font-mono text-base font-semibold ${
                              parsed.timestamps.status === 'VALID'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {parsed.timestamps.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                    <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">Signature</div>
                    <span className="text-orange-600 dark:text-orange-400 font-mono text-sm break-all">{parsed.signature}</span>
                  </div>
                </div>
              ) : (
                <div className="text-[hsl(var(--muted-foreground))] text-sm">Enter a JWT token to parse...</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
