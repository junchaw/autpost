import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface TextDiffPanelProps {
  onRemove: () => void;
}

interface DiffLine {
  type: 'same' | 'removed' | 'added';
  content: string;
}

export function TextDiffPanel({ onRemove }: TextDiffPanelProps) {
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
    <Card className="transition-all hover:shadow-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></div>
            <CardTitle className="text-lg">Text Diff</CardTitle>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label htmlFor="text-diff-input1" className="text-sm font-medium">Original Text</Label>
            <Textarea
              id="text-diff-input1"
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              placeholder="Enter original text..."
              rows={8}
              className="resize-none transition-colors focus-visible:ring-2"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="text-diff-input2" className="text-sm font-medium">Modified Text</Label>
            <Textarea
              id="text-diff-input2"
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              placeholder="Enter modified text..."
              rows={8}
              className="resize-none transition-colors focus-visible:ring-2"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="text-diff-output" className="text-sm font-medium">Differences</Label>
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
              <div>  = unchanged line</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
