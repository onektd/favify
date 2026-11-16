'use client';

import { useEffect, useState } from 'react';
import { Globe, Search, Smartphone } from 'lucide-react';
import { renderIconToCanvas } from '@/lib/iconRenderer';
import type { IconConfig, ManifestConfig, UploadedAsset } from '@/lib/types';

interface PreviewPanelProps {
  asset: UploadedAsset;
  config: IconConfig;
  manifest: ManifestConfig;
}

export function PreviewPanel({ asset, config, manifest }: PreviewPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    renderIconToCanvas(asset, config, 192).then((canvas) => {
      if (!cancelled) {
        setPreviewUrl(canvas.toDataURL('image/png'));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [asset, config]);

  const appLabel = manifest.shortName.trim() || manifest.name.trim() || 'Favify';

  return (
    <div className="divide-y divide-border h-full flex flex-col justify-between">
      {/* Browser Tab & Bookmark Preview */}
      <section className="p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-fg">
          <Globe className="h-3.5 w-3.5 text-muted shrink-0" />
          <h3 className="text-[13px] font-semibold tracking-tight">Browser &amp; bookmark</h3>
        </div>

        {/* Light browser */}
        <div className="rounded-lg border border-border bg-[#f1f3f4] px-2 pt-2 pb-0">
          <div className="flex items-center gap-1.5 px-1.5 pb-2">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-t-lg bg-white px-2.5 py-1 shadow-sm max-w-[190px]">
              {previewUrl && (
                <img src={previewUrl} alt="Favicon light preview" className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate text-[12px] font-medium text-[#16161d]">
                {manifest.name || 'Favify App'}
              </span>
            </div>
            <span className="text-[11px] text-[#5b5b68]">+</span>
          </div>
        </div>

        {/* Dark browser */}
        <div className="rounded-lg border border-border bg-[#202124] px-2 pt-2 pb-0">
          <div className="flex items-center gap-1.5 px-1.5 pb-2">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-t-lg bg-[#35363a] px-2.5 py-1 max-w-[190px]">
              {previewUrl && (
                <img src={previewUrl} alt="Favicon dark preview" className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate text-[12px] font-medium text-[#ededf2]">
                {manifest.name || 'Favify App'}
              </span>
            </div>
            <span className="text-[11px] text-[#a1a1ae]">+</span>
          </div>
        </div>

        {/* Bookmark bar pill */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-[11.5px] text-muted">Bookmark bar</span>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-0.5 max-w-[200px]">
            {previewUrl && (
              <img src={previewUrl} alt="Bookmark icon" className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="truncate text-[11.5px] font-medium text-fg">{appLabel}</span>
          </div>
        </div>
      </section>

      {/* Google Search Result (SERP) Preview */}
      <section className="p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-fg">
          <Search className="h-3.5 w-3.5 text-muted shrink-0" />
          <h3 className="text-[13px] font-semibold tracking-tight">Google search result</h3>
        </div>

        <div className="rounded-lg border border-border bg-surface-2/40 p-3 space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface p-0.5 overflow-hidden">
              {previewUrl && (
                <img src={previewUrl} alt="SERP favicon" className="h-full w-full object-contain rounded-full" />
              )}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[12px] font-medium text-fg">
                {manifest.name || 'Favify App'}
              </div>
              <div className="truncate text-[10.5px] text-muted">
                https://example.com{manifest.startUrl && manifest.startUrl !== '/' ? manifest.startUrl : ''}
              </div>
            </div>
          </div>
          <div className="truncate text-[13px] font-medium text-primary-text pt-0.5">
            {manifest.name || 'Favify App'} — Official Site
          </div>
          <p className="line-clamp-2 text-[11.5px] text-muted leading-snug">
            {manifest.description || 'Generated with Favify Icon & Manifest Studio.'}
          </p>
        </div>
      </section>

      {/* Mobile Home Screen Previews */}
      <section className="p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-fg">
          <Smartphone className="h-3.5 w-3.5 text-muted shrink-0" />
          <h3 className="text-[13px] font-semibold tracking-tight">iOS &amp; Android home screen</h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* iOS Mockup */}
          <div className="rounded-xl border border-border bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-sky-500/15 p-3 flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted">iOS Home</span>
            <div className="h-12 w-12 overflow-hidden rounded-[12px] shadow-md">
              {previewUrl && (
                <img src={previewUrl} alt="iOS icon preview" className="h-full w-full object-cover" />
              )}
            </div>
            <span className="max-w-full truncate text-[11.5px] font-medium text-fg">
              {appLabel}
            </span>
          </div>

          {/* Android Mockup */}
          <div className="rounded-xl border border-border bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-indigo-500/15 p-3 flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted">Android</span>
            <div className="h-12 w-12 overflow-hidden rounded-full shadow-md">
              {previewUrl && (
                <img src={previewUrl} alt="Android icon preview" className="h-full w-full object-cover" />
              )}
            </div>
            <span className="max-w-full truncate text-[11.5px] text-fg font-medium">
              {appLabel}
            </span>
          </div>
        </div>
      </section>

      {/* Size Scale Grid */}
      <section className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold tracking-tight text-fg">Standard sizes</h3>
          <span className="font-mono tabular-nums text-[11px] text-muted">16px – 512px</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[16, 32, 48, 64, 96].map((sz) => (
            <div key={sz} className="flex flex-col items-center gap-1.5">
              <div className="flex h-14 w-full items-center justify-center rounded-lg checkerboard border border-border">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt={`${sz}px preview`}
                    style={{ width: Math.min(sz, 48), height: Math.min(sz, 48) }}
                  />
                )}
              </div>
              <span className="font-mono tabular-nums text-[10.5px] text-muted">{sz}px</span>
            </div>
          ))}
        </div>
      </section>

      {/* PWA Splash Screen Preview */}
      <section className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold tracking-tight text-fg">PWA launch splash</h3>
          <span className="font-mono text-[10.5px] text-muted">{manifest.display}</span>
        </div>
        <div
          className="flex-1 min-h-[84px] rounded-xl border border-border flex flex-col items-center justify-center gap-1.5 p-3 shadow-inner"
          style={{ backgroundColor: manifest.backgroundColor || '#ffffff' }}
        >
          <div className="h-10 w-10 overflow-hidden rounded-xl shadow-sm">
            {previewUrl && (
              <img src={previewUrl} alt="PWA splash preview" className="h-full w-full object-cover" />
            )}
          </div>
          <span
            className="text-[11.5px] font-semibold tracking-tight truncate max-w-[200px]"
            style={{ color: manifest.themeColor || '#4f46e5' }}
          >
            {manifest.name || 'Favify App'}
          </span>
        </div>
      </section>
    </div>
  );
}
