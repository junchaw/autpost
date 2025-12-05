import { useState, useMemo } from 'react';

export function TextUniquePanel() {
  const [input, setInput] = useState('');
  const [sort, setSort] = useState(false);
  const [reverse, setReverse] = useState(false);

  const output = useMemo(() => {
    if (!input) {
      return '';
    }

    const lines = input.split('\n');
    let uniqueLines = Array.from(new Set(lines));

    if (sort) {
      uniqueLines = uniqueLines.sort();
      if (reverse) {
        uniqueLines = uniqueLines.reverse();
      }
    }

    return uniqueLines.join('\n');
  }, [input, sort, reverse]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <label className="label" htmlFor="text-unique-input">
          <span className="label-text font-medium">Input Text</span>
        </label>
        <textarea
          id="text-unique-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text with duplicate lines..."
          rows={8}
          className="textarea textarea-bordered w-full resize-none font-mono"
        />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sort-unique"
              checked={sort}
              onChange={(e) => setSort(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <label htmlFor="sort-unique" className="label-text cursor-pointer">
              Sort alphabetically
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="reverse-unique"
              checked={reverse}
              onChange={(e) => setReverse(e.target.checked)}
              disabled={!sort}
              className="checkbox checkbox-sm"
            />
            <label
              htmlFor="reverse-unique"
              className={`label-text cursor-pointer ${!sort ? 'opacity-50' : ''}`}
            >
              Sort in reverse order
            </label>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <label className="label" htmlFor="text-unique-output">
          <span className="label-text font-medium">Unique Lines</span>
        </label>
        <textarea
          id="text-unique-output"
          value={output}
          readOnly
          rows={8}
          className="textarea textarea-bordered w-full resize-none font-mono text-success"
        />
      </div>
    </div>
  );
}
