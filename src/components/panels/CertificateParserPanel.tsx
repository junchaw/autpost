import { useState, useMemo } from 'react';

interface ParsedCertificate {
  version?: string;
  serialNumber?: string;
  signature?: {
    algorithm: string;
  };
  issuer?: Record<string, string>;
  validity?: {
    notBefore: string;
    notAfter: string;
    status: 'VALID' | 'EXPIRED' | 'NOT_YET_VALID';
  };
  subject?: Record<string, string>;
  subjectPublicKeyInfo?: {
    algorithm: string;
    publicKeySize?: string;
  };
  extensions?: Record<string, string>;
}

const parseCertificate = (certText: string): ParsedCertificate => {
  // Remove PEM headers/footers
  const pemPattern = /-----BEGIN CERTIFICATE-----([^-]+)-----END CERTIFICATE-----/;
  const match = certText.match(pemPattern);

  if (!match) {
    throw new Error('Invalid certificate format. Expected PEM format.');
  }

  const base64Cert = match[1].replace(/\s/g, '');
  const binaryString = atob(base64Cert);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Parse basic certificate info (simplified parsing)
  const cert: ParsedCertificate = {};

  // Try to extract readable strings
  const text = String.fromCharCode.apply(null, Array.from(bytes));

  // Extract common certificate fields using regex patterns
  // eslint-disable-next-line no-control-regex
  const cnMatch = text.match(/CN=([^,\x00]+)/);
  // eslint-disable-next-line no-control-regex
  const oMatch = text.match(/O=([^,\x00]+)/);
  // eslint-disable-next-line no-control-regex
  const ouMatch = text.match(/OU=([^,\x00]+)/);
  const cMatch = text.match(/C=([A-Z]{2})/);

  if (cnMatch || oMatch || ouMatch || cMatch) {
    cert.subject = {};
    if (cnMatch) cert.subject['CN (Common Name)'] = cnMatch[1].trim();
    if (oMatch) cert.subject['O (Organization)'] = oMatch[1].trim();
    if (ouMatch) cert.subject['OU (Organizational Unit)'] = ouMatch[1].trim();
    if (cMatch) cert.subject['C (Country)'] = cMatch[1];
  }

  // Look for dates (ASN.1 UTCTime or GeneralizedTime)
  const datePattern = /(\d{12,14}Z)/g;
  const dates = text.match(datePattern);
  if (dates && dates.length >= 2) {
    const parseDate = (dateStr: string): string => {
      let year, month, day, hour, min, sec;
      if (dateStr.length === 13) {
        // UTCTime YYMMDDHHMMSSZ
        year = parseInt('20' + dateStr.substr(0, 2));
        month = dateStr.substr(2, 2);
        day = dateStr.substr(4, 2);
        hour = dateStr.substr(6, 2);
        min = dateStr.substr(8, 2);
        sec = dateStr.substr(10, 2);
      } else {
        // GeneralizedTime YYYYMMDDHHMMSSZ
        year = parseInt(dateStr.substr(0, 4));
        month = dateStr.substr(4, 2);
        day = dateStr.substr(6, 2);
        hour = dateStr.substr(8, 2);
        min = dateStr.substr(10, 2);
        sec = dateStr.substr(12, 2);
      }
      return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`).toISOString();
    };

    const notBefore = parseDate(dates[0]);
    const notAfter = parseDate(dates[1]);
    const now = new Date();
    const notBeforeDate = new Date(notBefore);
    const notAfterDate = new Date(notAfter);

    let status: 'VALID' | 'EXPIRED' | 'NOT_YET_VALID' = 'VALID';
    if (now < notBeforeDate) status = 'NOT_YET_VALID';
    if (now > notAfterDate) status = 'EXPIRED';

    cert.validity = { notBefore, notAfter, status };
  }

  // Detect common algorithms
  if (text.includes('rsaEncryption') || text.includes('RSA')) {
    cert.subjectPublicKeyInfo = { algorithm: 'RSA' };
  } else if (text.includes('ecPublicKey') || text.includes('prime256v1')) {
    cert.subjectPublicKeyInfo = { algorithm: 'EC (Elliptic Curve)' };
  }

  return cert;
};

export function CertificateParserPanel() {
  const [input, setInput] = useState('');

  const { parsed, error } = useMemo(() => {
    if (!input) {
      return { parsed: null, error: '' };
    }

    try {
      const result = parseCertificate(input);
      return { parsed: result, error: '' };
    } catch (err) {
      return {
        parsed: null,
        error: err instanceof Error ? err.message : 'Failed to parse certificate',
      };
    }
  }, [input]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <label className="label" htmlFor="cert-parser-input">
          <span className="label-text font-medium">Certificate Input (PEM)</span>
        </label>
        <textarea
          id="cert-parser-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your certificate in PEM format (-----BEGIN CERTIFICATE-----...)"
          rows={8}
          className="resize-none transition-colors focus-visible:ring-2 font-mono text-xs"
        />
      </div>
      <div className="space-y-3">
        <label className="label">
          <span className="label-text font-medium">Certificate Details</span>
        </label>
        <div className="min-h-[200px] overflow-y-auto border rounded-md bg-[hsl(var(--muted))] p-4">
          {error ? (
            <div className="text-red-600 dark:text-red-400 font-medium">{error}</div>
          ) : parsed ? (
            <div className="space-y-4">
              {parsed.subject && (
                <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                  <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">
                    Subject
                  </div>
                  <div className="space-y-2 text-sm">
                    {Object.entries(parsed.subject).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">
                          {key}
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-mono text-base">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsed.validity && (
                <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                  <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">
                    Validity
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[hsl(var(--muted-foreground))]">
                        Not Before
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-mono text-base">
                        {parsed.validity.notBefore}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[hsl(var(--muted-foreground))]">
                        Not After
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-mono text-base">
                        {parsed.validity.notAfter}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[hsl(var(--muted-foreground))]">
                        Status
                      </span>
                      <span
                        className={`font-mono text-base font-semibold ${
                          parsed.validity.status === 'VALID'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {parsed.validity.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {parsed.subjectPublicKeyInfo && (
                <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                  <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">
                    Public Key
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[hsl(var(--muted-foreground))]">
                        Algorithm
                      </span>
                      <span className="text-purple-600 dark:text-purple-400 font-mono text-base">
                        {parsed.subjectPublicKeyInfo.algorithm}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[hsl(var(--muted-foreground))] text-sm">
              Enter a certificate to parse...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
