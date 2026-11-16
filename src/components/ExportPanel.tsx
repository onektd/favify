'use client';

import { useState } from 'react';
import { Archive, Download, FileCode2, FileImage } from 'lucide-react';
import { encodeIco } from '@/lib/icoEncoder';
import { renderIconToPngBlob, renderIconToPngBytes, renderIconToSvgString } from '@/lib/iconRenderer';
import { exportCompleteZip, triggerDownload } from '@/lib/zipExporter';
import type { IconConfig, ManifestConfig, UploadedAsset } from '@/lib/types';
import { FrameworkCodeCard } from './FrameworkCodeCard';
import { Button, Field, Input } from './ui/primitives';

interface ExportPanelProps {
  asset: UploadedAsset;
  iconConfig: IconConfig;
  manifestConfig: ManifestConfig;
}

const STANDARD_PNG_SIZES = [16, 32, 48, 64, 128, 180, 192, 512, 1024];

export function ExportPanel({ asset, iconConfig, manifestConfig }: ExportPanelProps) {
  const [zipBusy, setZipBusy] = useState(false);
  const [customSize, setCustomSize] = useState('256');

  const handleDownloadZip = async () => {
    setZipBusy(true);
    try {
      const blob = await exportCompleteZip(asset, iconConfig, manifestConfig);
      triggerDownload(blob, 'favify-icons.zip');
    } finally {
      setZipBusy(false);
    }
  };

  const handleDownloadPng = async (size: number) => {
    const blob = await renderIconToPngBlob(asset, iconConfig, size);
    triggerDownload(blob, `icon-${size}x${size}.png`);
  };

  const handleDownloadSvg = () => {
    const svg = renderIconToSvgString(asset, iconConfig, 512);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(blob, 'favicon.svg');
  };

  const handleDownloadIco = async () => {
    const [p16, p32, p48] = await Promise.all([
      renderIconToPngBytes(asset, iconConfig, 16),
      renderIconToPngBytes(asset, iconConfig, 32),
      renderIconToPngBytes(asset, iconConfig, 48),
    ]);
    const ico = encodeIco([
      { size: 16, data: p16 },
      { size: 32, data: p32 },
      { size: 48, data: p48 },
    ]);
    const copy = new Uint8Array(ico.byteLength);
    copy.set(ico);
    triggerDownload(new Blob([copy.buffer], { type: 'image/x-icon' }), 'favicon.ico');
  };

  const parsedCustom = Math.max(16, Math.min(2048, parseInt(customSize, 10) || 256));

  return (
    <div className="divide-y divide-border h-full flex flex-col justify-between">
      {/* Full ZIP Package */}
      <section className="p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-fg">
          <Archive className="h-3.5 w-3.5 text-muted shrink-0" />
          <h3 className="text-[13px] font-semibold tracking-tight">Complete icon bundle</h3>
        </div>
        <ul className="space-y-1 text-[11.5px] text-muted">
          <li><span className="font-mono text-fg">assets/</span> · favicons, apple-touch, PWA PNGs &amp; site.webmanifest</li>
          <li><span className="font-mono text-fg">ios/</span> &amp; <span className="font-mono text-fg">android/</span> · Xcode AppIcon.appiconset &amp; mipmap folders</li>
          <li><span className="font-mono text-fg">snippets/</span> &amp; <span className="font-mono text-fg">INSTRUCTIONS.md</span> · all 9 frameworks</li>
          <li><span className="font-mono text-fg">favify.json</span> · re-importable project settings</li>
        </ul>
        <Button
          variant="primary"
          size="md"
          className="w-full"
          loading={zipBusy}
          icon={<Download />}
          onClick={handleDownloadZip}
        >
          Download favify-icons.zip
        </Button>
      </section>

      {/* Multi-Framework Instructions & Snippets */}
      <FrameworkCodeCard manifest={manifestConfig} />

      {/* Vector, ICO & Individual PNG Sizes */}
      <section className="p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-fg">
          <FileImage className="h-3.5 w-3.5 text-muted shrink-0" />
          <h3 className="text-[13px] font-semibold tracking-tight">Individual files &amp; sizes</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button size="xs" variant="secondary" icon={<FileCode2 />} onClick={handleDownloadSvg}>
            favicon.svg
          </Button>
          <Button size="xs" variant="secondary" icon={<Download />} onClick={handleDownloadIco}>
            favicon.ico
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {STANDARD_PNG_SIZES.map((sz) => (
            <Button
              key={sz}
              size="xs"
              variant="outline"
              onClick={() => handleDownloadPng(sz)}
              className="font-mono tabular-nums text-[11.5px]"
            >
              {sz}×{sz}
            </Button>
          ))}
        </div>

        <Field label="Custom PNG size (px)">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={16}
              max={2048}
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              className="font-mono tabular-nums h-8"
            />
            <Button
              size="sm"
              variant="secondary"
              icon={<Download />}
              onClick={() => handleDownloadPng(parsedCustom)}
            >
              Export
            </Button>
          </div>
        </Field>
      </section>
    </div>
  );
}
