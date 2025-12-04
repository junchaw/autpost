import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import QRCode from 'react-qr-code';

export function QRCodePanel() {
  const [input, setInput] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!qrRef.current || !input) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Clone the SVG to avoid modifying the original
    const svgClone = svg.cloneNode(true) as SVGElement;

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qrcode.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div>
          <label className="label" htmlFor="qr-input">
            <span className="label-text font-medium">Text or URL</span>
          </label>
          <textarea
            id="qr-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text or URL to generate QR code..."
            rows={4}
            className="textarea textarea-bordered w-full resize-none font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="qr-size">
              <span className="label-text font-medium">Size</span>
            </label>
            <input
              type="number"
              id="qr-size"
              value={size}
              onChange={(e) => setSize(Math.max(128, Math.min(512, Number(e.target.value))))}
              min="128"
              max="512"
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="label" htmlFor="qr-level">
              <span className="label-text font-medium">Error Correction</span>
            </label>
            <select
              id="qr-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
              className="select select-bordered w-full"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="qr-fg-color">
              <span className="label-text font-medium">Foreground Color</span>
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                id="qr-fg-color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="h-10 w-14 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="input input-bordered flex-1 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="qr-bg-color">
              <span className="label-text font-medium">Background Color</span>
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                id="qr-bg-color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-10 w-14 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="input input-bordered flex-1 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="label">
          <span className="label-text font-medium">QR Code Preview</span>
        </label>
        <div
          ref={qrRef}
          className="min-h-[200px] flex items-center justify-center border rounded-md p-4"
          style={{ backgroundColor: bgColor }}
        >
          {input ? (
            <QRCode
              value={input}
              size={Math.min(size, 300)}
              level={level}
              fgColor={fgColor}
              bgColor={bgColor}
            />
          ) : (
            <div className="text-[hsl(var(--muted-foreground))] text-sm text-center">
              Enter text or URL to generate QR code
            </div>
          )}
        </div>
        {input && (
          <button onClick={handleDownload} className="btn btn-outline w-full gap-2">
            <Download className="h-4 w-4" />
            Download SVG
          </button>
        )}
      </div>
    </div>
  );
}
