import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface URLEncodeDecodePanelProps {
  onRemove: () => void;
}

export function URLEncodeDecodePanel({ onRemove }: URLEncodeDecodePanelProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  useEffect(() => {
    try {
      if (mode === 'encode') {
        const encoded = input ? encodeURIComponent(input) : '';
        setOutput(encoded);
      } else {
        const decoded = input ? decodeURIComponent(input) : '';
        setOutput(decoded);
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid input'}`);
    }
  }, [input, mode]);

  return (
    <Card className="transition-all hover:shadow-lg h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]"></div>
              <CardTitle className="text-lg">URL Encoder/Decoder</CardTitle>
            </div>
            <div className="flex gap-2 text-sm">
              <label className="cursor-pointer flex items-center px-3 py-1 rounded-md hover:bg-[hsl(var(--muted))] transition-colors">
                <input
                  type="radio"
                  value="encode"
                  checked={mode === 'encode'}
                  onChange={() => setMode('encode')}
                  className="mr-2"
                />
                Encode
              </label>
              <label className="cursor-pointer flex items-center px-3 py-1 rounded-md hover:bg-[hsl(var(--muted))] transition-colors">
                <input
                  type="radio"
                  value="decode"
                  checked={mode === 'decode'}
                  onChange={() => setMode('decode')}
                  className="mr-2"
                />
                Decode
              </label>
            </div>
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
            <Label htmlFor="url-encodedecode-input" className="text-sm font-medium">Input</Label>
            <Textarea
              id="url-encodedecode-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to URL encode...' : 'Enter URL encoded text to decode...'}
              rows={8}
              className="resize-none transition-colors focus-visible:ring-2"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="url-encodedecode-output" className="text-sm font-medium">
              {mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}
            </Label>
            <Textarea
              id="url-encodedecode-output"
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
