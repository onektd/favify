'use client';

import { Code2, Download, FileJson, Wand2 } from 'lucide-react';
import { buildHtmlHeadSnippet, buildWebManifest } from '@/lib/manifestBuilder';
import { triggerDownload } from '@/lib/zipExporter';
import type { IconConfig, ManifestConfig } from '@/lib/types';
import {
  Button,
  CopyButton,
  Field,
  Input,
  Select,
} from './ui/primitives';

interface ManifestPanelProps {
  manifest: ManifestConfig;
  iconConfig: IconConfig;
  onChange: (updater: (prev: ManifestConfig) => ManifestConfig) => void;
}

export function ManifestPanel({ manifest, iconConfig, onChange }: ManifestPanelProps) {
  const update = <K extends keyof ManifestConfig>(key: K, value: ManifestConfig[K]) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const syncColorsFromIcon = () => {
    const primary =
      iconConfig.bgType === 'gradient'
        ? iconConfig.gradientStart
        : iconConfig.bgType === 'solid'
          ? iconConfig.bgColor
          : '#4f46e5';
    onChange((prev) => ({
      ...prev,
      themeColor: primary,
      backgroundColor: primary,
    }));
  };

  const manifestJson = buildWebManifest(manifest);
  const headHtml = buildHtmlHeadSnippet(manifest);

  const downloadManifestFile = () => {
    const blob = new Blob([manifestJson], { type: 'application/manifest+json' });
    triggerDownload(blob, 'site.webmanifest');
  };

  return (
    <div className="divide-y divide-border h-full flex flex-col justify-between">
      <section className="p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-fg">
            <FileJson className="h-3.5 w-3.5 text-muted shrink-0" />
            <h3 className="text-[13px] font-semibold tracking-tight">Web app manifest</h3>
          </div>
          <Button size="xs" variant="ghost" icon={<Wand2 />} onClick={syncColorsFromIcon}>
            Sync colors
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="App name">
            <Input
              value={manifest.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Favify App"
            />
          </Field>
          <Field label="Short name">
            <Input
              value={manifest.shortName}
              onChange={(e) => update('shortName', e.target.value)}
              placeholder="Favify"
            />
          </Field>
        </div>

        <Field label="Description">
          <Input
            value={manifest.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="A brief description of your web app"
          />
        </Field>

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Start URL">
            <Input
              value={manifest.startUrl}
              onChange={(e) => update('startUrl', e.target.value)}
              placeholder="/"
            />
          </Field>
          <Field label="Display mode">
            <Select
              value={manifest.display}
              onChange={(e) =>
                update('display', e.target.value as ManifestConfig['display'])
              }
            >
              <option value="standalone">standalone</option>
              <option value="minimal-ui">minimal-ui</option>
              <option value="fullscreen">fullscreen</option>
              <option value="browser">browser</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Field
            label="Theme color"
            valueDisplay={manifest.themeColor.toUpperCase()}
            colorEdit={{
              value: manifest.themeColor,
              onChange: (hex) => update('themeColor', hex),
            }}
          >
            <input
              type="color"
              aria-label="Theme color"
              value={manifest.themeColor}
              onChange={(e) => update('themeColor', e.target.value)}
              className="h-8 w-full cursor-pointer rounded-md border border-border bg-surface p-1"
            />
          </Field>
          <Field
            label="Background"
            valueDisplay={manifest.backgroundColor.toUpperCase()}
            colorEdit={{
              value: manifest.backgroundColor,
              onChange: (hex) => update('backgroundColor', hex),
            }}
          >
            <input
              type="color"
              aria-label="Manifest background color"
              value={manifest.backgroundColor}
              onChange={(e) => update('backgroundColor', e.target.value)}
              className="h-8 w-full cursor-pointer rounded-md border border-border bg-surface p-1"
            />
          </Field>
        </div>
      </section>

      <section className="p-4 space-y-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-fg">
            <FileJson className="h-3.5 w-3.5 text-muted shrink-0" />
            <h3 className="text-[13px] font-semibold tracking-tight">site.webmanifest</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="xs" variant="secondary" icon={<Download />} onClick={downloadManifestFile}>
              Save
            </Button>
            <CopyButton text={manifestJson} />
          </div>
        </div>
        <pre className="flex-1 min-h-[120px] max-h-44 overflow-auto scroll-thin rounded-lg border border-border bg-surface-2/70 p-3 font-mono text-[11px] leading-relaxed text-fg">
          {manifestJson}
        </pre>
      </section>

      <section className="p-4 space-y-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-fg">
            <Code2 className="h-3.5 w-3.5 text-muted shrink-0" />
            <h3 className="text-[13px] font-semibold tracking-tight">HTML &lt;head&gt; tags</h3>
          </div>
          <CopyButton text={headHtml} />
        </div>
        <pre className="flex-1 min-h-[108px] max-h-36 overflow-auto scroll-thin rounded-lg border border-border bg-surface-2/70 p-3 font-mono text-[11px] leading-relaxed text-fg">
          {headHtml}
        </pre>
      </section>
    </div>
  );
}
