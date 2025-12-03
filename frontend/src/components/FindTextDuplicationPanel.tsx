import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface FindTextDuplicationPanelProps {
  onRemove: () => void;
}

export function FindTextDuplicationPanel({ onRemove }: FindTextDuplicationPanelProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!input) {
      setOutput('');
      return;
    }

    const lines = input.split('\n');
    const lineCount = new Map<string, number>();

    // Count occurrences of each line
    lines.forEach(line => {
      lineCount.set(line, (lineCount.get(line) || 0) + 1);
    });

    // Find duplicates
    const duplicates = Array.from(lineCount.entries())
      .filter(([, count]) => count > 1)
      .map(([line, count]) => `${line} ${count}`)
      .join('\n');

    if (duplicates) {
      setOutput(duplicates);
    } else {
      setOutput('No duplicates found.');
    }
  }, [input]);

  return (
    <Card className="transition-all hover:shadow-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></div>
            <CardTitle className="text-lg">Find Text Duplication</CardTitle>
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
            <Label htmlFor="find-duplication-input" className="text-sm font-medium">Input Text</Label>
            <Textarea
              id="find-duplication-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to find duplicates..."
              rows={8}
              className="resize-none transition-colors focus-visible:ring-2"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="find-duplication-output" className="text-sm font-medium">Duplicate Lines</Label>
            <Textarea
              id="find-duplication-output"
              value={output}
              readOnly
              rows={8}
              className="resize-none text-orange-600 dark:text-orange-400 bg-[hsl(var(--muted))] cursor-default"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
