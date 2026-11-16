'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Download,
  Eye,
  FileJson,
  Package,
  Redo2,
  RotateCcw,
  Undo2,
} from 'lucide-react';
import { BorderControls } from '@/components/BorderControls';
import { ExportPanel } from '@/components/ExportPanel';
import { IconCanvasEditor } from '@/components/IconCanvasEditor';
import { LegalFooterAndModals } from '@/components/LegalFooterAndModals';
import { ManifestPanel } from '@/components/ManifestPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { BackgroundControls, ShapeAndArtworkControls } from '@/components/StyleControls';
import { TransformControls } from '@/components/TransformControls';
import { UploadDropzone } from '@/components/UploadDropzone';
import { Button, SegmentedControl } from '@/components/ui/primitives';
import {
  DEFAULT_ICON_CONFIG,
  DEFAULT_MANIFEST_CONFIG,
  getDefaultAsset,
  type IconConfig,
  type ManifestConfig,
  type ThemeMode,
  type UploadedAsset,
} from '@/lib/types';
import { exportCompleteZip, triggerDownload } from '@/lib/zipExporter';

type RightTab = 'previews' | 'manifest' | 'export';

interface StudioSnapshot {
  asset: UploadedAsset;
  iconConfig: IconConfig;
  manifestConfig: ManifestConfig;
}

const STORAGE_KEY = 'favify.studio.v1';
const MAX_HISTORY = 40;

function parseSvgDimensions(rawSvg: string): { width: number; height: number } {
  const viewBoxMatch = rawSvg.match(
    /viewBox\s*=\s*["']\s*([0-9.-]+)\s+([0-9.-]+)\s+([0-9.]+)\s+([0-9.]+)\s*["']/i,
  );
  if (viewBoxMatch) {
    return {
      width: parseFloat(viewBoxMatch[3]) || 120,
      height: parseFloat(viewBoxMatch[4]) || 120,
    };
  }
  const wMatch = rawSvg.match(/\bwidth\s*=\s*["']([0-9.]+)(?:px)?["']/i);
  const hMatch = rawSvg.match(/\bheight\s*=\s*["']([0-9.]+)(?:px)?["']/i);
  return {
    width: wMatch ? parseFloat(wMatch[1]) : 120,
    height: hMatch ? parseFloat(hMatch[1]) : 120,
  };
}

export default function FavifyStudioPage() {
  const [asset, setAsset] = useState<UploadedAsset>(() => getDefaultAsset());
  const [iconConfig, setIconConfig] = useState<IconConfig>(DEFAULT_ICON_CONFIG);
  const [manifestConfig, setManifestConfig] = useState<ManifestConfig>(DEFAULT_MANIFEST_CONFIG);
  const [rightTab, setRightTab] = useState<RightTab>('previews');
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [zipBusy, setZipBusy] = useState(false);

  // Undo / Redo history
  const [past, setPast] = useState<StudioSnapshot[]>([]);
  const [future, setFuture] = useState<StudioSnapshot[]>([]);
  const isApplyingHistoryRef = useRef(false);
  const hydratedRef = useRef(false);
  const lastCommittedRef = useRef<StudioSnapshot>({
    asset: getDefaultAsset(),
    iconConfig: DEFAULT_ICON_CONFIG,
    manifestConfig: DEFAULT_MANIFEST_CONFIG,
  });

  // Restore saved studio session and theme from localStorage on mount
  useEffect(() => {
    const savedTheme = window.localStorage.getItem('favify.theme') as ThemeMode | null;
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      setTheme(savedTheme);
    }

    try {
      const rawSession = window.localStorage.getItem(STORAGE_KEY);
      if (rawSession) {
        const parsed = JSON.parse(rawSession) as Partial<StudioSnapshot>;
        const restoredAsset = parsed.asset?.dataUrl ? parsed.asset : getDefaultAsset();
        const restoredIcon: IconConfig = { ...DEFAULT_ICON_CONFIG, ...(parsed.iconConfig ?? {}) };
        const restoredManifest: ManifestConfig = {
          ...DEFAULT_MANIFEST_CONFIG,
          ...(parsed.manifestConfig ?? {}),
        };
        isApplyingHistoryRef.current = true;
        setAsset(restoredAsset);
        setIconConfig(restoredIcon);
        setManifestConfig(restoredManifest);
        lastCommittedRef.current = {
          asset: restoredAsset,
          iconConfig: restoredIcon,
          manifestConfig: restoredManifest,
        };
      }
    } catch {
      // Ignore corrupt localStorage entries
    } finally {
      hydratedRef.current = true;
      setTimeout(() => {
        isApplyingHistoryRef.current = false;
      }, 50);
    }
  }, []);

  // Debounced history tracking + auto-save to localStorage
  useEffect(() => {
    if (!hydratedRef.current) return;

    const current: StudioSnapshot = { asset, iconConfig, manifestConfig };

    // Auto-save to localStorage
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
      // Ignore storage quota errors
    }

    if (isApplyingHistoryRef.current) {
      lastCommittedRef.current = current;
      return;
    }

    const timer = window.setTimeout(() => {
      const prev = lastCommittedRef.current;
      if (JSON.stringify(prev) !== JSON.stringify(current)) {
        setPast((p) => [...p.slice(-(MAX_HISTORY - 1)), prev]);
        setFuture([]);
        lastCommittedRef.current = current;
      }
    }, 260);

    return () => window.clearTimeout(timer);
  }, [asset, iconConfig, manifestConfig]);

  const handleUndo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const current: StudioSnapshot = { asset, iconConfig, manifestConfig };
    isApplyingHistoryRef.current = true;
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [current, ...f.slice(0, MAX_HISTORY - 1)]);
    setAsset(previous.asset);
    setIconConfig(previous.iconConfig);
    setManifestConfig(previous.manifestConfig);
    lastCommittedRef.current = previous;
    setTimeout(() => {
      isApplyingHistoryRef.current = false;
    }, 50);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const current: StudioSnapshot = { asset, iconConfig, manifestConfig };
    isApplyingHistoryRef.current = true;
    setFuture((f) => f.slice(1));
    setPast((p) => [...p.slice(-(MAX_HISTORY - 1)), current]);
    setAsset(next.asset);
    setIconConfig(next.iconConfig);
    setManifestConfig(next.manifestConfig);
    lastCommittedRef.current = next;
    setTimeout(() => {
      isApplyingHistoryRef.current = false;
    }, 50);
  };

  // Keyboard shortcuts for Undo (Ctrl+Z / Cmd+Z), Redo (Ctrl+Y / Cmd+Shift+Z), and Paste (Ctrl+V)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        e.key.toLowerCase() === 'y' ||
        (e.key.toLowerCase() === 'z' && e.shiftKey)
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;
          e.preventDefault();

          if (item.type === 'image/svg+xml') {
            const reader = new FileReader();
            reader.onload = () => {
              const rawSvg = String(reader.result || '');
              const { width, height } = parseSvgDimensions(rawSvg);
              const encoded = btoa(unescape(encodeURIComponent(rawSvg)));
              setAsset({
                kind: 'svg',
                dataUrl: `data:image/svg+xml;base64,${encoded}`,
                rawSvg,
                width,
                height,
                fileName: 'pasted-artwork.svg',
              });
            };
            reader.readAsText(file);
          } else {
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = String(reader.result || '');
              const img = new Image();
              img.onload = () => {
                setAsset({
                  kind: 'raster',
                  dataUrl,
                  width: img.naturalWidth || 512,
                  height: img.naturalHeight || 512,
                  fileName: 'pasted-image.png',
                });
              };
              img.src = dataUrl;
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }

      // Check if raw SVG markup was pasted as plain text
      const text = e.clipboardData?.getData('text/plain')?.trim();
      if (text && text.startsWith('<svg') && text.includes('</svg>')) {
        e.preventDefault();
        const { width, height } = parseSvgDimensions(text);
        const encoded = btoa(unescape(encodeURIComponent(text)));
        setAsset({
          kind: 'svg',
          dataUrl: `data:image/svg+xml;base64,${encoded}`,
          rawSvg: text,
          width,
          height,
          fileName: 'pasted-vector.svg',
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('paste', onPaste);
    };
  });

  useEffect(() => {
    window.localStorage.setItem('favify.theme', theme);
    const root = document.documentElement;
    const apply = (mode: 'light' | 'dark') => {
      root.classList.toggle('dark', mode === 'dark');
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const listener = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
    apply(theme);
  }, [theme]);

  const handleResetAll = () => {
    setAsset(getDefaultAsset());
    setIconConfig(DEFAULT_ICON_CONFIG);
    setManifestConfig(DEFAULT_MANIFEST_CONFIG);
  };

  const handleImportProject = (project: {
    asset: UploadedAsset;
    iconConfig: IconConfig;
    manifestConfig: ManifestConfig;
  }) => {
    setAsset(project.asset);
    setIconConfig(project.iconConfig);
    setManifestConfig(project.manifestConfig);
  };

  const handleQuickExportZip = async () => {
    setZipBusy(true);
    try {
      const blob = await exportCompleteZip(asset, iconConfig, manifestConfig);
      triggerDownload(blob, 'favify-icons.zip');
    } finally {
      setZipBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-fg">
      {/* Top Bar */}
      <header className="shrink-0 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366f1] to-[#4338ca] shadow-card">
              <svg viewBox="0 0 120 120" className="h-7 w-7" fill="none">
                <path
                  d="M38 30H82C85.3 30 88 32.7 88 36V40C88 43.3 85.3 46 82 46H54V56H74C77.3 56 80 58.7 80 62V64C80 67.3 77.3 70 74 70H54V86C54 89.3 51.3 92 48 92H44C40.7 92 38 89.3 38 86V30Z"
                  fill="#ffffff"
                />
                <path
                  d="M84 68L87.5 76.5L96 80L87.5 83.5L84 92L80.5 83.5L72 80L80.5 76.5L84 68Z"
                  fill="#c7d2fe"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold tracking-tight text-fg">Favify</span>
              <span className="hidden sm:inline-block rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11.5px] text-muted">
                One mark, every tab and home screen — crafted in seconds.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
              <button
                type="button"
                onClick={handleUndo}
                disabled={past.length === 0}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
                className="flex h-7 w-7 items-center justify-center rounded-md text-fg transition-colors hover:bg-surface-2 disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={future.length === 0}
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
                className="flex h-7 w-7 items-center justify-center rounded-md text-fg transition-colors hover:bg-surface-2 disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button size="sm" variant="secondary" icon={<RotateCcw />} onClick={handleResetAll}>
              Reset all
            </Button>

            <Button
              size="sm"
              variant="primary"
              loading={zipBusy}
              icon={<Download />}
              onClick={handleQuickExportZip}
            >
              Export ZIP
            </Button>
          </div>
        </div>
      </header>

      {/* Main Studio Workspace — Unified Bento Grid */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)_370px] items-stretch">
          {/* Left + Center Unified 3-Row Grid so every card row aligns horizontally */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-4 items-stretch">
            {/* Row 1 Left: Source artwork */}
            <div className="h-full">
              <UploadDropzone
                asset={asset}
                onAssetChange={setAsset}
                onImportProject={handleImportProject}
              />
            </div>

            {/* Row 1 & 2 Center: Interactive Canvas Editor (spans 2 rows to match Source + Artwork effects) */}
            <div className="md:row-span-2 h-full">
              <IconCanvasEditor
                asset={asset}
                config={iconConfig}
                onChange={setIconConfig}
              />
            </div>

            {/* Row 2 Left: Shape & effects */}
            <div className="h-full">
              <ShapeAndArtworkControls
                asset={asset}
                config={iconConfig}
                onChange={setIconConfig}
              />
            </div>

            {/* Row 3 Left: Background */}
            <div className="h-full">
              <BackgroundControls
                config={iconConfig}
                onChange={setIconConfig}
              />
            </div>

            {/* Row 3 Center: Position & scale + Border aligned side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
              <TransformControls
                config={iconConfig}
                onChange={setIconConfig}
              />
              <BorderControls
                config={iconConfig}
                onChange={setIconConfig}
              />
            </div>
          </div>

          {/* Right Column: Unified Panel for Previews, Manifest & Export (stretches full height of grid) */}
          <section className="rounded-xl border border-border bg-surface shadow-card overflow-hidden flex flex-col h-full min-w-0">
            <div className="flex h-12 items-center border-b border-border bg-surface-2/40 px-2 shrink-0">
              <SegmentedControl<RightTab>
                fullWidth
                value={rightTab}
                onChange={setRightTab}
                options={[
                  {
                    value: 'previews',
                    label: (
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        Previews
                      </span>
                    ),
                  },
                  {
                    value: 'manifest',
                    label: (
                      <span className="flex items-center gap-1.5">
                        <FileJson className="h-3.5 w-3.5" />
                        Manifest
                      </span>
                    ),
                  },
                  {
                    value: 'export',
                    label: (
                      <span className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5" />
                        Export
                      </span>
                    ),
                  },
                ]}
              />
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] flex-1 min-w-0">
              <div
                aria-hidden={rightTab !== 'previews'}
                className={
                  rightTab === 'previews'
                    ? 'col-start-1 row-start-1 min-w-0 w-full'
                    : 'col-start-1 row-start-1 min-w-0 w-full opacity-0 invisible pointer-events-none select-none'
                }
              >
                <PreviewPanel
                  asset={asset}
                  config={iconConfig}
                  manifest={manifestConfig}
                />
              </div>

              <div
                aria-hidden={rightTab !== 'manifest'}
                className={
                  rightTab === 'manifest'
                    ? 'col-start-1 row-start-1 min-w-0 w-full'
                    : 'col-start-1 row-start-1 min-w-0 w-full opacity-0 invisible pointer-events-none select-none'
                }
              >
                <ManifestPanel
                  manifest={manifestConfig}
                  iconConfig={iconConfig}
                  onChange={setManifestConfig}
                />
              </div>

              <div
                aria-hidden={rightTab !== 'export'}
                className={
                  rightTab === 'export'
                    ? 'col-start-1 row-start-1 min-w-0 w-full'
                    : 'col-start-1 row-start-1 min-w-0 w-full opacity-0 invisible pointer-events-none select-none'
                }
              >
                <ExportPanel
                  asset={asset}
                  iconConfig={iconConfig}
                  manifestConfig={manifestConfig}
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      <LegalFooterAndModals theme={theme} onThemeChange={setTheme} />
    </div>
  );
}
