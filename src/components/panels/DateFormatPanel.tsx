import { useState, useMemo } from 'react';

const DOC_LINKS: Record<string, string> = {
  php: 'https://www.php.net/manual/en/datetime.format.php',
  python: 'https://docs.python.org/3/library/datetime.html#strftime-and-strptime-format-codes',
  golang: 'https://pkg.go.dev/time#pkg-constants',
  javascript:
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat',
  c: 'https://en.cppreference.com/w/c/chrono/strftime',
};

const formatPhp = (date: Date, fmt: string): string => {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const replacements: Record<string, string> = {
    d: pad(date.getDate()),
    D: days[date.getDay()].substring(0, 3),
    j: String(date.getDate()),
    l: days[date.getDay()],
    N: String(date.getDay() || 7),
    w: String(date.getDay()),
    F: months[date.getMonth()],
    m: pad(date.getMonth() + 1),
    M: months[date.getMonth()].substring(0, 3),
    n: String(date.getMonth() + 1),
    Y: String(date.getFullYear()),
    y: String(date.getFullYear()).substring(2),
    a: date.getHours() >= 12 ? 'pm' : 'am',
    A: date.getHours() >= 12 ? 'PM' : 'AM',
    g: String(date.getHours() % 12 || 12),
    G: String(date.getHours()),
    h: pad(date.getHours() % 12 || 12),
    H: pad(date.getHours()),
    i: pad(date.getMinutes()),
    s: pad(date.getSeconds()),
    c: date.toISOString(),
    U: String(Math.floor(date.getTime() / 1000)),
  };

  let result = fmt;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value);
  }
  return result;
};

const formatPython = (date: Date, fmt: string): string => {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const replacements: Record<string, string> = {
    '%a': days[date.getDay()].substring(0, 3),
    '%A': days[date.getDay()],
    '%w': String(date.getDay()),
    '%d': pad(date.getDate()),
    '%b': months[date.getMonth()].substring(0, 3),
    '%B': months[date.getMonth()],
    '%m': pad(date.getMonth() + 1),
    '%y': String(date.getFullYear()).substring(2),
    '%Y': String(date.getFullYear()),
    '%H': pad(date.getHours()),
    '%I': pad(date.getHours() % 12 || 12),
    '%p': date.getHours() >= 12 ? 'PM' : 'AM',
    '%M': pad(date.getMinutes()),
    '%S': pad(date.getSeconds()),
    '%%': '%',
  };

  let result = fmt;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key.replace('%', '\\%'), 'g'), value);
  }
  return result;
};

const formatGolang = (date: Date, fmt: string): string => {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const replacements: Array<[RegExp, string]> = [
    [/2006/g, String(date.getFullYear())],
    [/06/g, String(date.getFullYear()).substring(2)],
    [/January/g, months[date.getMonth()]],
    [/Jan/g, months[date.getMonth()].substring(0, 3)],
    [/01/g, pad(date.getMonth() + 1)],
    [/(?<!0)1(?!5)/g, String(date.getMonth() + 1)],
    [/Monday/g, days[date.getDay()]],
    [/Mon/g, days[date.getDay()].substring(0, 3)],
    [/02/g, pad(date.getDate())],
    [/_2/g, String(date.getDate()).padStart(2, ' ')],
    [/(?<!0)2(?!006)/g, String(date.getDate())],
    [/15/g, pad(date.getHours())],
    [/03/g, pad(date.getHours() % 12 || 12)],
    [/(?<!0)3/g, String(date.getHours() % 12 || 12)],
    [/PM/g, date.getHours() >= 12 ? 'PM' : 'AM'],
    [/pm/g, date.getHours() >= 12 ? 'pm' : 'am'],
    [/04/g, pad(date.getMinutes())],
    [/(?<!0)4/g, String(date.getMinutes())],
    [/05/g, pad(date.getSeconds())],
    [/(?<!0)5/g, String(date.getSeconds())],
  ];

  let result = fmt;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  return result;
};

const formatJavaScript = (date: Date, fmt: string): string => {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const replacements: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    YY: String(date.getFullYear()).substring(2),
    MMMM: months[date.getMonth()],
    MMM: months[date.getMonth()].substring(0, 3),
    MM: pad(date.getMonth() + 1),
    M: String(date.getMonth() + 1),
    DD: pad(date.getDate()),
    D: String(date.getDate()),
    dddd: days[date.getDay()],
    ddd: days[date.getDay()].substring(0, 3),
    HH: pad(date.getHours()),
    H: String(date.getHours()),
    hh: pad(date.getHours() % 12 || 12),
    h: String(date.getHours() % 12 || 12),
    mm: pad(date.getMinutes()),
    m: String(date.getMinutes()),
    ss: pad(date.getSeconds()),
    s: String(date.getSeconds()),
    A: date.getHours() >= 12 ? 'PM' : 'AM',
    a: date.getHours() >= 12 ? 'pm' : 'am',
  };

  let result = fmt;
  // Sort by length descending to replace longer patterns first
  const sortedKeys = Object.keys(replacements).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    result = result.replace(new RegExp(key, 'g'), replacements[key]);
  }
  return result;
};

const formatC = (date: Date, fmt: string): string => {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthsShort = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const replacements: Record<string, string> = {
    '%a': daysShort[date.getDay()],
    '%A': days[date.getDay()],
    '%b': monthsShort[date.getMonth()],
    '%B': months[date.getMonth()],
    '%d': pad(date.getDate()),
    '%e': String(date.getDate()).padStart(2, ' '),
    '%m': pad(date.getMonth() + 1),
    '%y': String(date.getFullYear()).substring(2),
    '%Y': String(date.getFullYear()),
    '%H': pad(date.getHours()),
    '%I': pad(date.getHours() % 12 || 12),
    '%M': pad(date.getMinutes()),
    '%S': pad(date.getSeconds()),
    '%p': date.getHours() >= 12 ? 'PM' : 'AM',
    '%%': '%',
  };

  let result = fmt;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key.replace('%', '\\%'), 'g'), value);
  }
  return result;
};

export function DateFormatPanel() {
  const [language, setLanguage] = useState<'php' | 'python' | 'golang' | 'javascript' | 'c'>('php');
  const [format, setFormat] = useState('');
  const [timestamp, setTimestamp] = useState<string>(() => new Date().toISOString());

  const output = useMemo(() => {
    if (!format || !timestamp) {
      return '';
    }

    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Error: Invalid date/time';
      }

      if (language === 'php') {
        return formatPhp(date, format);
      } else if (language === 'python') {
        return formatPython(date, format);
      } else if (language === 'golang') {
        return formatGolang(date, format);
      } else if (language === 'javascript') {
        return formatJavaScript(date, format);
      } else if (language === 'c') {
        return formatC(date, format);
      }
      return '';
    } catch (err) {
      return `Error: ${err instanceof Error ? err.message : 'Invalid format'}`;
    }
  }, [language, format, timestamp]);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="label">
          <span className="label-text font-medium">Language</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={() => setLanguage('php')}>
            PHP
          </button>
          <button className="btn" onClick={() => setLanguage('python')}>
            Python
          </button>
          <button className="btn" onClick={() => setLanguage('golang')}>
            Golang
          </button>
          <button className="btn" onClick={() => setLanguage('javascript')}>
            JavaScript
          </button>
          <button className="btn" onClick={() => setLanguage('c')}>
            C
          </button>
        </div>
        <a
          href={DOC_LINKS[language]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
        >
          View {language.toUpperCase()} Date Format Documentation
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="label" htmlFor="date-format-input">
            <span className="label-text font-medium">Format String</span>
          </label>
          <textarea
            id="date-format-input"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            placeholder={
              language === 'php'
                ? 'Y-m-d H:i:s'
                : language === 'python'
                  ? '%Y-%m-%d %H:%M:%S'
                  : language === 'golang'
                    ? '2006-01-02 15:04:05'
                    : language === 'javascript'
                      ? 'YYYY-MM-DD HH:mm:ss'
                      : '%Y-%m-%d %H:%M:%S'
            }
            rows={3}
            className="resize-none transition-colors focus-visible:ring-2 font-mono"
          />
        </div>
        <div className="space-y-3">
          <label className="label" htmlFor="date-timestamp-input">
            <span className="label-text font-medium">Date/Time (ISO 8601)</span>
          </label>
          <textarea
            id="date-timestamp-input"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="2024-01-15T14:30:00Z"
            rows={3}
            className="resize-none transition-colors focus-visible:ring-2 font-mono text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="label" htmlFor="date-format-output">
          <span className="label-text font-medium">Formatted Output</span>
        </label>
        <textarea
          id="date-format-output"
          value={output}
          readOnly
          rows={2}
          className="resize-none text-green-600 dark:text-green-400 bg-[hsl(var(--muted))] cursor-default font-mono"
        />
      </div>
    </div>
  );
}
