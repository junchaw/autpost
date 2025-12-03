import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface TextSortPanelProps {
  onRemove: () => void;
}

export function TextSortPanel({ onRemove }: TextSortPanelProps) {
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
    <Card className="transition-all hover:shadow-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></div>
            <CardTitle className="text-lg">Text Sort</CardTitle>
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
            <Label htmlFor="text-sort-input" className="text-sm font-medium">Input Text</Label>
            <Textarea
              id="text-sort-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to sort..."
              rows={8}
              className="resize-none transition-colors focus-visible:ring-2"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reverse-sort"
                  checked={reverse}
                  onChange={(e) => setReverse(e.target.checked)}
                  className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
                <Label htmlFor="reverse-sort" className="text-sm cursor-pointer">
                  Sort in reverse order
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="unique-sort"
                  checked={unique}
                  onChange={(e) => setUnique(e.target.checked)}
                  className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
                <Label htmlFor="unique-sort" className="text-sm cursor-pointer">
                  Remove duplicates
                </Label>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="text-sort-output" className="text-sm font-medium">Sorted Text</Label>
            <Textarea
              id="text-sort-output"
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
