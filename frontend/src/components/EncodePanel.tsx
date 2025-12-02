import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface EncodePanelProps {
  onRemove: () => void;
}

export function EncodePanel({ onRemove }: EncodePanelProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    try {
      const encoded = input ? btoa(input) : '';
      setOutput(encoded);
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`);
    }
  }, [input]);

  return (
    <Card className="transition-all hover:shadow-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></div>
            <CardTitle className="text-lg">Base64 Encoder</CardTitle>
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
            <Label htmlFor="encode-input" className="text-sm font-medium">Input</Label>
            <Textarea
              id="encode-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to encode..."
              rows={8}
              className="resize-none transition-colors focus-visible:ring-2"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="encode-output" className="text-sm font-medium">Encoded Output</Label>
            <Textarea
              id="encode-output"
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
