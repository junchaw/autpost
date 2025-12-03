import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface URLSimultaneousPanelProps {
  onRemove: () => void;
}

export function URLSimultaneousPanel({ onRemove }: URLSimultaneousPanelProps) {
  const [input, setInput] = useState('');
  const [encodedOutput, setEncodedOutput] = useState('');
  const [decodedOutput, setDecodedOutput] = useState('');

  useEffect(() => {
    // Encode
    try {
      const encoded = input ? encodeURIComponent(input) : '';
      setEncodedOutput(encoded);
    } catch (error) {
      setEncodedOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`);
    }

    // Decode
    try {
      const decoded = input ? decodeURIComponent(input) : '';
      setDecodedOutput(decoded);
    } catch (error) {
      setDecodedOutput(`Error: ${error instanceof Error ? error.message : 'Invalid URL encoded input'}`);
    }
  }, [input]);

  return (
    <Card className="transition-all hover:shadow-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></div>
            <CardTitle className="text-lg">URL Encode/Decode Simultaneously</CardTitle>
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
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="url-simultaneous-input" className="text-sm font-medium">Input</Label>
            <Textarea
              id="url-simultaneous-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to encode and decode..."
              rows={6}
              className="resize-none transition-colors focus-visible:ring-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="url-encoded-output" className="text-sm font-medium">Encoded Output</Label>
              <Textarea
                id="url-encoded-output"
                value={encodedOutput}
                readOnly
                rows={6}
                className="resize-none text-green-600 dark:text-green-400 bg-[hsl(var(--muted))] cursor-default"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="url-decoded-output" className="text-sm font-medium">Decoded Output</Label>
              <Textarea
                id="url-decoded-output"
                value={decodedOutput}
                readOnly
                rows={6}
                className="resize-none text-blue-600 dark:text-blue-400 bg-[hsl(var(--muted))] cursor-default"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
