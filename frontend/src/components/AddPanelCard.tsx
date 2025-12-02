import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AddPanelCardProps {
  onAddPanel: (panelType: string) => void;
}

export function AddPanelCard({ onAddPanel }: AddPanelCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => onAddPanel('base64-encode')}
            variant="outline"
            className="w-full justify-start"
          >
            Base64 Encoder
          </Button>
          <Button
            onClick={() => onAddPanel('base64-decode')}
            variant="outline"
            className="w-full justify-start"
          >
            Base64 Decoder
          </Button>
          <Button
            onClick={() => onAddPanel('base64-encode-decode')}
            variant="outline"
            className="w-full justify-start"
          >
            Base64 Encoder/Decoder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
