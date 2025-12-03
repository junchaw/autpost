import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface TimestampParserPanelProps {
  onRemove: () => void;
}

interface ParsedTimestamp {
  unix: number;
  unixMs: number;
  iso8601: string;
  utc: string;
  localTime: string;
  selectedTimezone: string;
  components: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
  };
}

const ALL_TIMEZONES = [
  // UTC
  { label: 'UTC', value: 'UTC', region: 'UTC' },

  // Africa
  { label: 'Africa/Cairo', value: 'Africa/Cairo', region: 'Africa' },
  { label: 'Africa/Johannesburg', value: 'Africa/Johannesburg', region: 'Africa' },
  { label: 'Africa/Lagos', value: 'Africa/Lagos', region: 'Africa' },
  { label: 'Africa/Nairobi', value: 'Africa/Nairobi', region: 'Africa' },

  // America
  { label: 'America/Anchorage (AKST/AKDT)', value: 'America/Anchorage', region: 'America' },
  { label: 'America/Chicago (CST/CDT)', value: 'America/Chicago', region: 'America' },
  { label: 'America/Denver (MST/MDT)', value: 'America/Denver', region: 'America' },
  { label: 'America/Los_Angeles (PST/PDT)', value: 'America/Los_Angeles', region: 'America' },
  { label: 'America/Mexico_City', value: 'America/Mexico_City', region: 'America' },
  { label: 'America/New_York (EST/EDT)', value: 'America/New_York', region: 'America' },
  { label: 'America/Phoenix (MST)', value: 'America/Phoenix', region: 'America' },
  { label: 'America/Sao_Paulo', value: 'America/Sao_Paulo', region: 'America' },
  { label: 'America/Toronto', value: 'America/Toronto', region: 'America' },
  { label: 'America/Vancouver', value: 'America/Vancouver', region: 'America' },

  // Asia
  { label: 'Asia/Bangkok', value: 'Asia/Bangkok', region: 'Asia' },
  { label: 'Asia/Dubai', value: 'Asia/Dubai', region: 'Asia' },
  { label: 'Asia/Hong_Kong', value: 'Asia/Hong_Kong', region: 'Asia' },
  { label: 'Asia/Jakarta', value: 'Asia/Jakarta', region: 'Asia' },
  { label: 'Asia/Jerusalem', value: 'Asia/Jerusalem', region: 'Asia' },
  { label: 'Asia/Kolkata (IST)', value: 'Asia/Kolkata', region: 'Asia' },
  { label: 'Asia/Manila', value: 'Asia/Manila', region: 'Asia' },
  { label: 'Asia/Seoul', value: 'Asia/Seoul', region: 'Asia' },
  { label: 'Asia/Shanghai (CST)', value: 'Asia/Shanghai', region: 'Asia' },
  { label: 'Asia/Singapore (SGT)', value: 'Asia/Singapore', region: 'Asia' },
  { label: 'Asia/Taipei', value: 'Asia/Taipei', region: 'Asia' },
  { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo', region: 'Asia' },

  // Atlantic
  { label: 'Atlantic/Reykjavik', value: 'Atlantic/Reykjavik', region: 'Atlantic' },

  // Australia
  { label: 'Australia/Adelaide', value: 'Australia/Adelaide', region: 'Australia' },
  { label: 'Australia/Brisbane', value: 'Australia/Brisbane', region: 'Australia' },
  { label: 'Australia/Melbourne', value: 'Australia/Melbourne', region: 'Australia' },
  { label: 'Australia/Perth', value: 'Australia/Perth', region: 'Australia' },
  { label: 'Australia/Sydney (AEDT/AEST)', value: 'Australia/Sydney', region: 'Australia' },

  // Europe
  { label: 'Europe/Amsterdam', value: 'Europe/Amsterdam', region: 'Europe' },
  { label: 'Europe/Athens', value: 'Europe/Athens', region: 'Europe' },
  { label: 'Europe/Berlin', value: 'Europe/Berlin', region: 'Europe' },
  { label: 'Europe/Brussels', value: 'Europe/Brussels', region: 'Europe' },
  { label: 'Europe/Dublin', value: 'Europe/Dublin', region: 'Europe' },
  { label: 'Europe/Istanbul', value: 'Europe/Istanbul', region: 'Europe' },
  { label: 'Europe/London (GMT/BST)', value: 'Europe/London', region: 'Europe' },
  { label: 'Europe/Madrid', value: 'Europe/Madrid', region: 'Europe' },
  { label: 'Europe/Moscow', value: 'Europe/Moscow', region: 'Europe' },
  { label: 'Europe/Paris (CET/CEST)', value: 'Europe/Paris', region: 'Europe' },
  { label: 'Europe/Rome', value: 'Europe/Rome', region: 'Europe' },
  { label: 'Europe/Stockholm', value: 'Europe/Stockholm', region: 'Europe' },
  { label: 'Europe/Vienna', value: 'Europe/Vienna', region: 'Europe' },
  { label: 'Europe/Warsaw', value: 'Europe/Warsaw', region: 'Europe' },
  { label: 'Europe/Zurich', value: 'Europe/Zurich', region: 'Europe' },

  // Pacific
  { label: 'Pacific/Auckland (NZDT/NZST)', value: 'Pacific/Auckland', region: 'Pacific' },
  { label: 'Pacific/Fiji', value: 'Pacific/Fiji', region: 'Pacific' },
  { label: 'Pacific/Honolulu (HST)', value: 'Pacific/Honolulu', region: 'Pacific' },
];

export function TimestampParserPanel({ onRemove }: TimestampParserPanelProps) {
  const [input, setInput] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [parsed, setParsed] = useState<ParsedTimestamp | null>(null);
  const [error, setError] = useState<string>('');

  const filteredTimezones = timezoneSearch
    ? ALL_TIMEZONES.filter(tz =>
        tz.label.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
        tz.region.toLowerCase().includes(timezoneSearch.toLowerCase())
      )
    : ALL_TIMEZONES;

  useEffect(() => {
    if (!input) {
      setParsed(null);
      setError('');
      return;
    }

    try {
      let date: Date;

      // Try parsing as Unix timestamp (seconds or milliseconds)
      const num = Number(input.trim());
      if (!isNaN(num)) {
        // If it's a reasonable Unix timestamp (in seconds)
        if (num < 10000000000) {
          date = new Date(num * 1000);
        } else {
          // Assume milliseconds
          date = new Date(num);
        }
      } else {
        // Try parsing as date string
        date = new Date(input.trim());
      }

      if (isNaN(date.getTime())) {
        setError('Invalid timestamp or date format');
        setParsed(null);
        return;
      }

      // Format in selected timezone
      const tzFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const selectedTimezoneString = tzFormatter.format(date);

      setParsed({
        unix: Math.floor(date.getTime() / 1000),
        unixMs: date.getTime(),
        iso8601: date.toISOString(),
        utc: date.toUTCString(),
        localTime: date.toLocaleString(),
        selectedTimezone: selectedTimezoneString,
        components: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          hour: date.getHours(),
          minute: date.getMinutes(),
          second: date.getSeconds(),
          millisecond: date.getMilliseconds(),
        },
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse timestamp');
      setParsed(null);
    }
  }, [input, timezone]);

  return (
    <Card className="transition-all hover:shadow-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></div>
            <CardTitle className="text-lg">Timestamp Parser</CardTitle>
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
            <Label htmlFor="timestamp-input" className="text-sm font-medium">Timestamp Input</Label>
            <Textarea
              id="timestamp-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter Unix timestamp or date string&#10;(e.g., 1705329600 or 2024-01-15T14:30:00Z)"
              rows={3}
              className="resize-none transition-colors focus-visible:ring-2 font-mono text-sm"
            />
            <div className="space-y-2">
              <Label htmlFor="timezone-search" className="text-sm font-medium">Timezone</Label>
              <input
                id="timezone-search"
                type="text"
                value={timezoneSearch}
                onChange={(e) => setTimezoneSearch(e.target.value)}
                placeholder="Search timezones..."
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              <select
                id="timezone-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                size={5}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                {filteredTimezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                Showing {filteredTimezones.length} of {ALL_TIMEZONES.length} timezones
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Parsed Timestamp</Label>
            <div className="min-h-[200px] overflow-y-auto border rounded-md bg-[hsl(var(--muted))] p-4">
              {error ? (
                <div className="text-red-600 dark:text-red-400 font-medium">{error}</div>
              ) : parsed ? (
                <div className="space-y-4">
                  <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                    <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">Unix Timestamps</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">Unix (seconds)</span>
                        <span className="text-green-600 dark:text-green-400 font-mono text-base">{parsed.unix}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">Unix (milliseconds)</span>
                        <span className="text-green-600 dark:text-green-400 font-mono text-base">{parsed.unixMs}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                    <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">Formatted Dates</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">ISO 8601</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono text-base break-all">{parsed.iso8601}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">UTC</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono text-base break-all">{parsed.utc}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">{timezone}</span>
                        <span className="text-purple-600 dark:text-purple-400 font-mono text-base break-all">{parsed.selectedTimezone}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">Local</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono text-base break-all">{parsed.localTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card rounded-lg border border-[hsl(var(--border))] p-3">
                    <div className="text-xs font-semibold text-[hsl(var(--primary))] mb-3 uppercase tracking-wide">Components</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">Year</span>
                        <span className="text-orange-600 dark:text-orange-400 font-mono">{parsed.components.year}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">Month</span>
                        <span className="text-orange-600 dark:text-orange-400 font-mono">{parsed.components.month}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">Day</span>
                        <span className="text-orange-600 dark:text-orange-400 font-mono">{parsed.components.day}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">Hour</span>
                        <span className="text-orange-600 dark:text-orange-400 font-mono">{parsed.components.hour}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">Minute</span>
                        <span className="text-orange-600 dark:text-orange-400 font-mono">{parsed.components.minute}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[hsl(var(--muted-foreground))]">Second</span>
                        <span className="text-orange-600 dark:text-orange-400 font-mono">{parsed.components.second}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[hsl(var(--muted-foreground))] text-sm">Enter a timestamp to parse...</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
