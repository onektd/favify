'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ImagePlus, RotateCcw, Shapes, Type, Upload } from 'lucide-react';
import {
  buildGlyphAsset,
  buildMonogramAsset,
  CURATED_ICON_GLYPHS,
  MONOGRAM_FONTS,
  type MonogramFontId,
  type MonogramWeight,
} from '@/lib/markGenerator';
import { getDefaultAsset, type IconConfig, type ManifestConfig, type UploadedAsset } from '@/lib/types';
import { importProjectFromZip } from '@/lib/zipExporter';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  cn,
  Field,
  Input,
  RangeSlider,
  SegmentedControl,
} from './ui/primitives';

interface UploadDropzoneProps {
  asset: UploadedAsset;
  onAssetChange: (asset: UploadedAsset) => void;
  onImportProject: (project: {
    asset: UploadedAsset;
    iconConfig: IconConfig;
    manifestConfig: ManifestConfig;
  }) => void;
}

type SourceTab = 'upload' | 'text' | 'icon';

const MARK_SWATCHES = ['#ffffff', '#c7d2fe', '#fde047', '#34d399', '#38bdf8', '#16161d'];

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

export function UploadDropzone({
  asset,
  onAssetChange,
  onImportProject,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sourceTab, setSourceTab] = useState<SourceTab>('upload');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // Monogram / Text generator state
  const [monoText, setMonoText] = useState('FV');
  const [monoFont, setMonoFont] = useState<MonogramFontId>('sans');
  const [monoWeight, setMonoWeight] = useState<MonogramWeight>('700');
  const [monoColor, setMonoColor] = useState('#ffffff');

  // Icon glyph generator state
  const [glyphId, setGlyphId] = useState('sparkles');
  const [glyphStroke, setGlyphStroke] = useState(2);
  const [glyphColor, setGlyphColor] = useState('#ffffff');

  const applyMonogram = (
    nextText = monoText,
    nextFont = monoFont,
    nextWeight = monoWeight,
    nextColor = monoColor,
  ) => {
    setError(null);
    setStatus(null);
    onAssetChange(
      buildMonogramAsset({
        text: nextText,
        fontId: nextFont,
        fontWeight: nextWeight,
        color: nextColor,
      }),
    );
  };

  const applyGlyph = (
    nextId = glyphId,
    nextStroke = glyphStroke,
    nextColor = glyphColor,
  ) => {
    setError(null);
    setStatus(null);
    onAssetChange(
      buildGlyphAsset({
        glyphId: nextId,
        strokeWidth: nextStroke,
        color: nextColor,
      }),
    );
  };

  const handleTabChange = (tab: SourceTab) => {
    setSourceTab(tab);
    if (tab === 'text') {
      applyMonogram();
    } else if (tab === 'icon') {
      applyGlyph();
    }
  };

  const handleZipFile = async (file: File) => {
    setError(null);
    setStatus(null);
    try {
      const project = await importProjectFromZip(file);
      onImportProject(project);
      setStatus(`Restored ${file.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read Favify ZIP.');
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setStatus(null);

    const isZip =
      file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed' ||
      file.name.toLowerCase().endsWith('.zip');
    if (isZip) {
      void handleZipFile(file);
      return;
    }

    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const isRaster = /^image\/(png|jpeg|jpg|webp|gif)$/i.test(file.type);

    if (!isSvg && !isRaster) {
      setError('Please upload an SVG, PNG, JPG, WebP, or Favify .zip file.');
      return;
    }

    if (isSvg) {
      const reader = new FileReader();
      reader.onload = () => {
        const rawSvg = String(reader.result || '');
        const { width, height } = parseSvgDimensions(rawSvg);
        const encoded = btoa(unescape(encodeURIComponent(rawSvg)));
        onAssetChange({
          kind: 'svg',
          dataUrl: `data:image/svg+xml;base64,${encoded}`,
          rawSvg,
          width,
          height,
          fileName: file.name,
        });
      };
      reader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        onAssetChange({
          kind: 'raster',
          dataUrl,
          width: img.naturalWidth || 512,
          height: img.naturalHeight || 512,
          fileName: file.name,
        });
      };
      img.onerror = () => setError('Could not decode the selected image.');
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        icon={<ImagePlus className="h-4 w-4" />}
        title="Source artwork"
        action={
          <div className="flex items-center gap-1.5">
            <Badge tone={asset.kind === 'svg' ? 'primary' : 'neutral'}>
              {asset.kind === 'svg' ? 'SVG' : 'Raster'}
            </Badge>
            <Button
              size="xs"
              variant="ghost"
              icon={<RotateCcw />}
              onClick={() => {
                setError(null);
                setStatus(null);
                setSourceTab('upload');
                onAssetChange(getDefaultAsset());
              }}
              title="Load built-in sample mark"
            >
              Sample
            </Button>
          </div>
        }
      />
      <div className="p-4 gap-3 flex-1 flex flex-col justify-between">
        <SegmentedControl<SourceTab>
          fullWidth
          value={sourceTab}
          onChange={handleTabChange}
          options={[
            {
              value: 'upload',
              label: (
                <span className="flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  Upload
                </span>
              ),
            },
            {
              value: 'text',
              label: (
                <span className="flex items-center gap-1">
                  <Type className="h-3 w-3" />
                  Text
                </span>
              ),
            },
            {
              value: 'icon',
              label: (
                <span className="flex items-center gap-1">
                  <Shapes className="h-3 w-3" />
                  Icon
                </span>
              ),
            },
          ]}
        />

        <div className="grid grid-cols-[minmax(0,1fr)] flex-1 items-stretch">
          {/* Upload Tab */}
          <div
            aria-hidden={sourceTab !== 'upload'}
            className={
              sourceTab === 'upload'
                ? 'col-start-1 row-start-1 flex flex-col justify-between gap-2.5'
                : 'col-start-1 row-start-1 flex flex-col justify-between gap-2.5 opacity-0 invisible pointer-events-none select-none'
            }
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
              }}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-3 py-4 text-center transition-colors cursor-pointer',
                dragging
                  ? 'border-primary bg-primary-soft/60'
                  : 'border-border-strong bg-surface-2/50 hover:bg-surface-2',
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface border border-border shadow-card text-muted">
                <Upload className="h-3.5 w-3.5" />
              </div>
              <div className="text-[12.5px] font-medium text-fg">
                Drop SVG, PNG, JPG, or .zip
              </div>
              <div className="text-[11px] text-muted">
                Browse or paste (Ctrl+V)
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".svg,.png,.jpg,.jpeg,.webp,.zip,image/svg+xml,image/png,image/jpeg,image/webp,application/zip"
                onChange={handleChange}
                className="hidden"
              />
            </div>

            {error && <p className="text-[11.5px] text-danger">{error}</p>}
            {status && <p className="text-[11.5px] text-success">{status}</p>}

            <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-2/70 px-2.5 py-1.5">
              <p className="truncate text-[12px] font-medium text-fg">{asset.fileName}</p>
              <span className="font-mono tabular-nums text-[11px] text-muted shrink-0">
                {Math.round(asset.width)}×{Math.round(asset.height)}
              </span>
            </div>
          </div>

          {/* Text / Monogram Tab */}
          <div
            aria-hidden={sourceTab !== 'text'}
            className={
              sourceTab === 'text'
                ? 'col-start-1 row-start-1 flex flex-col justify-between gap-2.5'
                : 'col-start-1 row-start-1 flex flex-col justify-between gap-2.5 opacity-0 invisible pointer-events-none select-none'
            }
          >
            <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-2.5">
              <Field label="Letters">
                <Input
                  value={monoText}
                  maxLength={3}
                  placeholder="FV"
                  onChange={(e) => {
                    const val = e.target.value.slice(0, 3);
                    setMonoText(val);
                    applyMonogram(val, monoFont, monoWeight, monoColor);
                  }}
                />
              </Field>
              <Field label="Weight">
                <SegmentedControl<MonogramWeight>
                  fullWidth
                  value={monoWeight}
                  onChange={(w) => {
                    setMonoWeight(w);
                    applyMonogram(monoText, monoFont, w, monoColor);
                  }}
                  options={[
                    { value: '600', label: 'Semi' },
                    { value: '700', label: 'Bold' },
                    { value: '800', label: 'Heavy' },
                  ]}
                />
              </Field>
            </div>

            <Field label="Font style">
              <SegmentedControl<MonogramFontId>
                fullWidth
                value={monoFont}
                onChange={(f) => {
                  setMonoFont(f);
                  applyMonogram(monoText, f, monoWeight, monoColor);
                }}
                options={MONOGRAM_FONTS.map((f) => ({ value: f.id, label: f.label }))}
              />
            </Field>

            <Field
              label="Text color"
              valueDisplay={monoColor.toUpperCase()}
              colorEdit={{
                value: monoColor,
                onChange: (hex) => {
                  setMonoColor(hex);
                  applyMonogram(monoText, monoFont, monoWeight, hex);
                },
              }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Monogram text color"
                  value={monoColor}
                  onChange={(e) => {
                    setMonoColor(e.target.value);
                    applyMonogram(monoText, monoFont, monoWeight, e.target.value);
                  }}
                  className="h-8 w-8 cursor-pointer rounded-md border border-border bg-surface p-1 shrink-0"
                />
                <div className="flex flex-wrap gap-2">
                  {MARK_SWATCHES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      aria-label={`Text color ${hex}`}
                      onClick={() => {
                        setMonoColor(hex);
                        applyMonogram(monoText, monoFont, monoWeight, hex);
                      }}
                      className="h-4 w-4 rounded-full border border-border-strong transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </Field>
          </div>

          {/* Icon Glyph Tab */}
          <div
            aria-hidden={sourceTab !== 'icon'}
            className={
              sourceTab === 'icon'
                ? 'col-start-1 row-start-1 flex flex-col justify-between gap-2.5'
                : 'col-start-1 row-start-1 flex flex-col justify-between gap-2.5 opacity-0 invisible pointer-events-none select-none'
            }
          >
            <div className="grid grid-cols-6 gap-2 p-2 rounded-lg border border-border bg-surface-2/40">
              {CURATED_ICON_GLYPHS.map((g) => {
                const active = g.id === glyphId;
                return (
                  <button
                    key={g.id}
                    type="button"
                    title={g.label}
                    onClick={() => {
                      setGlyphId(g.id);
                      applyGlyph(g.id, glyphStroke, glyphColor);
                    }}
                    className={cn(
                      'flex h-8 w-full items-center justify-center rounded-md border transition-colors cursor-pointer',
                      active
                        ? 'border-primary bg-primary text-primary-fg shadow-card'
                        : 'border-transparent bg-surface text-fg hover:border-border-strong',
                    )}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      dangerouslySetInnerHTML={{ __html: g.inner24 }}
                    />
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2.5 items-start">
              <Field
                label="Stroke"
                valueDisplay={`${glyphStroke}px`}
                numericEdit={{
                  value: glyphStroke,
                  min: 1.25,
                  max: 3,
                  step: 0.25,
                  onChange: (v) => {
                    setGlyphStroke(v);
                    applyGlyph(glyphId, v, glyphColor);
                  },
                }}
              >
                <div className="flex h-8 items-center">
                  <RangeSlider
                    ariaLabel="Icon stroke width"
                    min={1.25}
                    max={3}
                    step={0.25}
                    value={glyphStroke}
                    onChange={(v) => {
                      setGlyphStroke(v);
                      applyGlyph(glyphId, v, glyphColor);
                    }}
                  />
                </div>
              </Field>

              <Field
                label="Color"
                valueDisplay={glyphColor.toUpperCase()}
                colorEdit={{
                  value: glyphColor,
                  onChange: (hex) => {
                    setGlyphColor(hex);
                    applyGlyph(glyphId, glyphStroke, hex);
                  },
                }}
              >
                <div className="flex h-8 items-center gap-2">
                  <input
                    type="color"
                    aria-label="Glyph color"
                    value={glyphColor}
                    onChange={(e) => {
                      setGlyphColor(e.target.value);
                      applyGlyph(glyphId, glyphStroke, e.target.value);
                    }}
                    className="h-8 w-8 cursor-pointer rounded-md border border-border bg-surface p-1 shrink-0"
                  />
                  <div className="flex flex-1 items-center justify-between gap-1">
                    {MARK_SWATCHES.slice(0, 4).map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        aria-label={`Glyph color ${hex}`}
                        onClick={() => {
                          setGlyphColor(hex);
                          applyGlyph(glyphId, glyphStroke, hex);
                        }}
                        className="h-4 w-4 rounded-full border border-border-strong transition-transform hover:scale-110 cursor-pointer shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </Field>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
