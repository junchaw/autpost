import { useState, useMemo } from 'react';

export function FindTextDuplicationPanel() {
  const [input, setInput] = useState('');

  const output = useMemo(() => {
    if (!input) {
      return '';
    }

    const lines = input.split('\n');
    const lineCount = new Map<string, number>();

    // Count occurrences of each line
    lines.forEach((line) => {
      lineCount.set(line, (lineCount.get(line) || 0) + 1);
    });

    // Find duplicates
    const duplicates = Array.from(lineCount.entries())
      .filter(([, count]) => count > 1)
      .map(([line, count]) => `${line} ${count}`)
      .join('\n');

    return duplicates || 'No duplicates found.';
  }, [input]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <label className="label" htmlFor="find-duplication-input">
          <span className="label-text font-medium">Input Text</span>
        </label>
        <textarea
          id="find-duplication-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to find duplicates..."
          rows={8}
          className="textarea textarea-bordered w-full resize-none font-mono"
        />
      </div>
      <div className="space-y-3">
        <label className="label" htmlFor="find-duplication-output">
          <span className="label-text font-medium">Duplicate Lines</span>
        </label>
        <textarea
          id="find-duplication-output"
          value={output}
          readOnly
          rows={8}
          className="resize-none text-orange-600 dark:text-orange-400 bg-[hsl(var(--muted))] cursor-default"
        />
      </div>
    </div>
  );
}
