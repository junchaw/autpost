import { useEffect, useRef, useCallback } from 'react';
import 'trix';
import 'trix/dist/trix.css';

// Disable file attachments in Trix
document.addEventListener('trix-file-accept', (e) => {
  e.preventDefault();
});

interface TrixEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function TrixEditor({ value, onChange, placeholder, autoFocus }: TrixEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<HTMLElement | null>(null);
  const initializedRef = useRef(false);

  const handleChange = useCallback(() => {
    if (inputRef.current) {
      onChange(inputRef.current.value);
    }
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;

    // Create hidden input
    const input = document.createElement('input');
    input.type = 'hidden';
    input.id = `trix-input-${Math.random().toString(36).slice(2)}`;
    input.value = value;
    inputRef.current = input;

    // Create trix-editor element
    const editor = document.createElement('trix-editor');
    editor.setAttribute('input', input.id);
    if (placeholder) {
      editor.setAttribute('placeholder', placeholder);
    }
    editor.className =
      'trix-content prose prose-sm max-w-none min-h-32 bg-base-100 rounded-lg border border-base-300 p-3';
    editorRef.current = editor;

    // Append to container
    containerRef.current.appendChild(input);
    containerRef.current.appendChild(editor);

    // Listen for changes
    editor.addEventListener('trix-change', handleChange);

    // Auto focus
    if (autoFocus) {
      setTimeout(() => {
        const trixEditor = editor as unknown as { editor?: { element: HTMLElement } };
        trixEditor.editor?.element?.focus();
      }, 100);
    }

    initializedRef.current = true;

    return () => {
      editor.removeEventListener('trix-change', handleChange);
    };
  }, [handleChange, placeholder, autoFocus, value]);

  // Update value when it changes externally
  useEffect(() => {
    if (editorRef.current && inputRef.current && initializedRef.current) {
      const trixEditor = editorRef.current as unknown as {
        editor?: { loadHTML: (html: string) => void };
      };
      if (trixEditor.editor && inputRef.current.value !== value) {
        trixEditor.editor.loadHTML(value);
      }
    }
  }, [value]);

  return <div ref={containerRef} className="trix-editor-wrapper" />;
}
