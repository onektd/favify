'use client';

import { useState } from 'react';
import { Code2, Download } from 'lucide-react';
import {
  buildFrameworkGuide,
  FRAMEWORK_OPTIONS,
  type FrameworkId,
} from '@/lib/manifestBuilder';
import { triggerDownload } from '@/lib/zipExporter';
import type { ManifestConfig } from '@/lib/types';
import { Button, CopyButton, cn } from './ui/primitives';

interface FrameworkCodeCardProps {
  manifest: ManifestConfig;
}

export function FrameworkCodeCard({ manifest }: FrameworkCodeCardProps) {
  const [framework, setFramework] = useState<FrameworkId>('html');
  const guide = buildFrameworkGuide(framework, manifest);

  const handleSaveSnippet = () => {
    triggerDownload(new Blob([guide.code], { type: guide.mime }), guide.filename);
  };

  return (
    <section className="p-4 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-fg">
          <Code2 className="h-3.5 w-3.5 text-muted shrink-0" />
          <h3 className="text-[13px] font-semibold tracking-tight">Framework integration</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="xs" variant="secondary" icon={<Download />} onClick={handleSaveSnippet}>
            Save
          </Button>
          <CopyButton text={guide.code} />
        </div>
      </div>

      {/* 9-Framework Pill Bar (HTML, React, Next.js, Ruby on Rails, Node, Node CLI, Gulp, Grunt, ASP.NET Core) */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-surface-2 p-1 border border-border/80">
        {FRAMEWORK_OPTIONS.map((opt) => {
          const active = opt.id === framework;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFramework(opt.id)}
              className={cn(
                'inline-flex items-center justify-center rounded px-2 py-1 text-[11.5px] font-medium transition-[color,background-color,box-shadow] cursor-pointer select-none',
                active
                  ? 'bg-primary text-primary-fg shadow-card'
                  : 'text-muted hover:text-fg hover:bg-surface/60',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Step-by-step instructions */}
      <ol className="list-decimal pl-4 space-y-1 text-[11.5px] leading-snug text-muted">
        {guide.steps.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ol>

      {/* Code snippet */}
      <pre className="max-h-32 overflow-auto scroll-thin rounded-lg border border-border bg-surface-2/70 p-3 font-mono text-[11px] leading-relaxed text-fg">
        {guide.code}
      </pre>
    </section>
  );
}
