import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button as ChakraButton,
} from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddPanelDialogProps {
  onAddPanel: (panelType: string) => void;
}

export function AddPanelDialog({ onAddPanel }: AddPanelDialogProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handlePanelSelect = (panelType: string) => {
    onAddPanel(panelType);
    onClose();
  };

  return (
    <>
      <Button className="gap-2" onClick={onOpen}>
        <Plus className="h-4 w-4" />
        Add Panel
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxH="80vh">
          <ModalHeader>Add Panel</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <div className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              Select a tool panel to add to your dashboard
            </div>
            <div className="grid gap-4 py-4">
          <div>
            <div className="text-sm font-semibold text-[hsl(var(--muted-foreground))] mb-3">Base64 Tools</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ChakraButton
                onClick={() => handlePanelSelect('base64-encode-decode')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                Base64 Encoder/Decoder
              </ChakraButton>
              <ChakraButton
                onClick={() => handlePanelSelect('base64-simultaneous')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                Base64 Encode/Decode Simultaneously
              </ChakraButton>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-[hsl(var(--muted-foreground))] mb-3">URL Tools</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ChakraButton
                onClick={() => handlePanelSelect('url-encode-decode')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                URL Encoder/Decoder
              </ChakraButton>
              <ChakraButton
                onClick={() => handlePanelSelect('url-simultaneous')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                URL Encode/Decode Simultaneously
              </ChakraButton>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-[hsl(var(--muted-foreground))] mb-3">Parser Tools</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ChakraButton
                onClick={() => handlePanelSelect('url-parser')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                URL Parser
              </ChakraButton>
              <ChakraButton
                onClick={() => handlePanelSelect('jwt-parser')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                JWT Parser
              </ChakraButton>
              <ChakraButton
                onClick={() => handlePanelSelect('certificate-parser')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                Certificate Parser
              </ChakraButton>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-[hsl(var(--muted-foreground))] mb-3">Text Tools</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ChakraButton
                onClick={() => handlePanelSelect('text-unique')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                Text Unique
              </ChakraButton>
              <ChakraButton
                onClick={() => handlePanelSelect('text-duplication')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                Find Text Duplication
              </ChakraButton>
              <ChakraButton
                onClick={() => handlePanelSelect('text-sort')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                Text Sort
              </ChakraButton>
              <ChakraButton
                onClick={() => handlePanelSelect('text-diff')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                Text Diff
              </ChakraButton>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-[hsl(var(--muted-foreground))] mb-3">Date & Time Tools</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ChakraButton
                onClick={() => handlePanelSelect('date-format')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                Date Format
              </ChakraButton>
              <ChakraButton
                onClick={() => handlePanelSelect('timestamp-parser')}
                variant="outline"
                width="full"
                justifyContent="flex-start"
                size="sm"
              >
                Timestamp Parser
              </ChakraButton>
            </div>
          </div>
        </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
