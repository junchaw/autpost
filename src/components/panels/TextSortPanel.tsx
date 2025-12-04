import { useState, useEffect } from 'react';

export function TextSortPanel() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [reverse, setReverse] = useState(false);
  const [unique, setUnique] = useState(false);

  useEffect(() => {
    if (!input) {
      setOutput('');
      return;
    }

    let lines = input.split('\n');

    if (unique) {
      lines = Array.from(new Set(lines));
    }

    const sorted = [...lines].sort();

    if (reverse) {
      sorted.reverse();
    }

    setOutput(sorted.join('\n'));
  }, [input, reverse, unique]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <label className="label" htmlFor="text-sort-input">
          <span className="label-text font-medium">Input Text</span>
        </label>
        <textarea
          id="text-sort-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to sort..."
          rows={8}
          className="textarea textarea-bordered w-full resize-none font-mono"
        />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="reverse-sort"
              checked={reverse}
              onChange={(e) => setReverse(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <label htmlFor="reverse-sort" className="text-sm cursor-pointer">
              Sort in reverse order
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="unique-sort"
              checked={unique}
              onChange={(e) => setUnique(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <label htmlFor="unique-sort" className="text-sm cursor-pointer">
              Remove duplicates
            </label>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <label className="label" htmlFor="text-sort-output">
          <span className="label-text font-medium">Sorted Text</span>
        </label>
        <textarea
          id="text-sort-output"
          value={output}
          readOnly
          rows={8}
          className="textarea textarea-bordered w-full resize-none font-mono text-success"
        />
      </div>
    </div>
  );
}
