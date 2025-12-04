import { useState, useEffect } from 'react';

interface DiffLine {
  type: 'same' | 'removed' | 'added';
  content: string;
}

export function TextDiffPanel() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);

  useEffect(() => {
    if (!text1 && !text2) {
      setDiffLines([]);
      return;
    }

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);

    const diff: DiffLine[] = [];

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';

      if (line1 === line2) {
        diff.push({ type: 'same', content: `  ${line1}` });
      } else {
        if (line1) diff.push({ type: 'removed', content: `- ${line1}` });
        if (line2) diff.push({ type: 'added', content: `+ ${line2}` });
      }
    }

    setDiffLines(diff);
  }, [text1, text2]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-3">
        <label className="label" htmlFor="text-diff-input1">
          <span className="label-text font-medium">Original Text</span>
        </label>
        <textarea
          id="text-diff-input1"
          value={text1}
          onChange={(e) => setText1(e.target.value)}
          placeholder="Enter original text..."
          rows={8}
          className="textarea textarea-bordered w-full resize-none font-mono"
        />
      </div>
      <div className="space-y-3">
        <label className="label" htmlFor="text-diff-input2">
          <span className="label-text font-medium">Modified Text</span>
        </label>
        <textarea
          id="text-diff-input2"
          value={text2}
          onChange={(e) => setText2(e.target.value)}
          placeholder="Enter modified text..."
          rows={8}
          className="textarea textarea-bordered w-full resize-none font-mono"
        />
      </div>
      <div className="space-y-3">
        <label className="label" htmlFor="text-diff-output">
          <span className="label-text font-medium">Differences</span>
        </label>
        <div className="min-h-[200px] border rounded-md bg-[hsl(var(--muted))] p-3 font-mono text-sm overflow-y-auto">
          {diffLines.length > 0 ? (
            diffLines.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.type === 'removed'
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 text-left'
                    : line.type === 'added'
                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 text-left'
                      : 'text-[hsl(var(--foreground))] text-left'
                }
              >
                {line.content}
              </div>
            ))
          ) : (
            <div className="text-[hsl(var(--muted-foreground))]">Enter text to compare...</div>
          )}
        </div>
        <div className="text-xs text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-2">
            <span className="text-red-600 dark:text-red-400">- = removed line</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 dark:text-green-400">+ = added line</span>
          </div>
          <div> = unchanged line</div>
        </div>
      </div>
    </div>
  );
}
