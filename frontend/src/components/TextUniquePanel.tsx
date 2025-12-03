import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface TextUniquePanelProps {
  onRemove: () => void;
}

export function TextUniquePanel({ onRemove }: TextUniquePanelProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [sort, setSort] = useState(false);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (!input) {
      setOutput('');
      return;
    }

    const lines = input.split('\n');
    let uniqueLines = Array.from(new Set(lines));

    if (sort) {
      uniqueLines = uniqueLines.sort();
      if (reverse) {
        uniqueLines = uniqueLines.reverse();
      }
    }

    setOutput(uniqueLines.join('\n'));
  }, [input, sort, reverse]);

  return (
    <Card className="transition-all hover:shadow-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></div>
            <CardTitle className="text-lg">Text Unique</CardTitle>
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
            <Label htmlFor="text-unique-input" className="text-sm font-medium">Input Text</Label>
            <Textarea
              id="text-unique-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text with duplicate lines..."
              rows={8}
              className="resize-none transition-colors focus-visible:ring-2"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sort-unique"
                  checked={sort}
                  onChange={(e) => setSort(e.target.checked)}
                  className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
                <Label htmlFor="sort-unique" className="text-sm cursor-pointer">
                  Sort alphabetically
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reverse-unique"
                  checked={reverse}
                  onChange={(e) => setReverse(e.target.checked)}
                  disabled={!sort}
                  className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Label htmlFor="reverse-unique" className={`text-sm cursor-pointer ${!sort ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  Sort in reverse order
                </Label>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="text-unique-output" className="text-sm font-medium">Unique Lines</Label>
            <Textarea
              id="text-unique-output"
              value={output}
              readOnly
              rows={8}
              className="resize-none text-green-600 dark:text-green-400 bg-[hsl(var(--muted))] cursor-default"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
