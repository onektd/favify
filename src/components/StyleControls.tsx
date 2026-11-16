'use client';

import { Palette, RotateCcw, Shapes } from 'lucide-react';
import {
  DEFAULT_ICON_CONFIG,
  type ArtworkTintMode,
  type BgType,
  type IconConfig,
  type ShadowMode,
  type ShapePreset,
  type UploadedAsset,
} from '@/lib/types';
import {
  Button,
  Card,
  CardHeader,
  Field,
  RangeSlider,
  SegmentedControl,
} from './ui/primitives';

interface StyleControlsProps {
  config: IconConfig;
  onChange: (updater: (prev: IconConfig) => IconConfig) => void;
}

const COLOR_SWATCHES = [
  '#4f46e5',
  '#6366f1',
  '#7c3aed',
  '#2563eb',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#16161d',
  '#ffffff',
];

export function ShapeAndArtworkControls({
  asset,
  config,
  onChange,
}: StyleControlsProps & { asset: UploadedAsset }) {
  const update = <K extends keyof IconConfig>(key: K, value: IconConfig[K]) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const resetShape = () => {
    onChange((prev) => ({
      ...prev,
      shapePreset: DEFAULT_ICON_CONFIG.shapePreset,
      cornerRadius: DEFAULT_ICON_CONFIG.cornerRadius,
      tintMode: DEFAULT_ICON_CONFIG.tintMode,
      tintColor: DEFAULT_ICON_CONFIG.tintColor,
      shadowMode: DEFAULT_ICON_CONFIG.shadowMode,
      shadowOpacity: DEFAULT_ICON_CONFIG.shadowOpacity,
      shadowBlur: DEFAULT_ICON_CONFIG.shadowBlur,
      shadowOffsetY: DEFAULT_ICON_CONFIG.shadowOffsetY,
    }));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        icon={<Shapes className="h-4 w-4" />}
        title="Shape & effects"
        action={
          <Button size="xs" variant="ghost" icon={<RotateCcw />} onClick={resetShape}>
            Reset
          </Button>
        }
      />
      <div className="p-4 gap-3 flex-1 flex flex-col justify-between">
        <Field label="Icon shape">
          <SegmentedControl<ShapePreset>
            fullWidth
            value={config.shapePreset}
            onChange={(shapePreset) => update('shapePreset', shapePreset)}
            options={[
              { value: 'squircle', label: 'Squircle' },
              { value: 'rounded', label: 'Rounded' },
              { value: 'circle', label: 'Circle' },
              { value: 'square', label: 'Square' },
            ]}
          />
        </Field>

        <Field
          label="Corner radius"
          valueDisplay={
            config.shapePreset === 'squircle'
              ? '24% (Squircle)'
              : config.shapePreset === 'circle'
                ? '50% (Circle)'
                : config.shapePreset === 'square'
                  ? '0% (Square)'
                  : `${config.cornerRadius}%`
          }
          numericEdit={
            config.shapePreset === 'rounded'
              ? {
                  value: config.cornerRadius,
                  min: 0,
                  max: 45,
                  step: 1,
                  onChange: (v) => update('cornerRadius', v),
                }
              : undefined
          }
        >
          <RangeSlider
            ariaLabel="Corner radius"
            min={0}
            max={50}
            step={1}
            value={
              config.shapePreset === 'squircle'
                ? 24
                : config.shapePreset === 'circle'
                  ? 50
                  : config.shapePreset === 'square'
                    ? 0
                    : config.cornerRadius
            }
            onChange={(v) => {
              onChange((prev) => ({
                ...prev,
                shapePreset: v === 0 ? 'square' : v >= 49 ? 'circle' : 'rounded',
                cornerRadius: Math.min(45, v),
              }));
            }}
          />
        </Field>

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="SVG color">
            <SegmentedControl<ArtworkTintMode>
              fullWidth
              value={asset.kind === 'svg' ? config.tintMode : 'original'}
              onChange={(tintMode) => {
                if (asset.kind === 'svg') update('tintMode', tintMode);
              }}
              options={[
                { value: 'original', label: 'Original' },
                { value: 'solid', label: 'Recolor' },
              ]}
            />
          </Field>

          <Field label="Shadow">
            <SegmentedControl<ShadowMode>
              fullWidth
              value={config.shadowMode}
              onChange={(shadowMode) => update('shadowMode', shadowMode)}
              options={[
                { value: 'none', label: 'None' },
                { value: 'soft', label: 'Soft' },
              ]}
            />
          </Field>
        </div>

        {asset.kind === 'svg' && config.tintMode === 'solid' && (
          <Field
            label="Tint color"
            valueDisplay={config.tintColor.toUpperCase()}
            colorEdit={{
              value: config.tintColor,
              onChange: (hex) => update('tintColor', hex),
            }}
          >
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="SVG tint color"
                value={config.tintColor}
                onChange={(e) => update('tintColor', e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-md border border-border bg-surface p-1 shrink-0"
              />
              <div className="flex flex-wrap gap-2">
                {COLOR_SWATCHES.slice(0, 6).map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    aria-label={`Tint ${hex}`}
                    onClick={() => update('tintColor', hex)}
                    className="h-4 w-4 rounded-full border border-border-strong transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          </Field>
        )}

        {config.shadowMode === 'soft' && (
          <div className="grid grid-cols-2 gap-2.5">
            <Field
              label="Blur"
              valueDisplay={`${config.shadowBlur}%`}
              numericEdit={{
                value: config.shadowBlur,
                min: 1,
                max: 24,
                step: 1,
                onChange: (v) => update('shadowBlur', Math.round(v)),
              }}
            >
              <RangeSlider
                ariaLabel="Shadow blur"
                min={1}
                max={24}
                step={1}
                value={config.shadowBlur}
                onChange={(v) => update('shadowBlur', v)}
              />
            </Field>

            <Field
              label="Opacity"
              valueDisplay={`${Math.round(config.shadowOpacity * 100)}%`}
              numericEdit={{
                value: Math.round(config.shadowOpacity * 100),
                min: 5,
                max: 85,
                step: 5,
                onChange: (pct) => update('shadowOpacity', Math.round(pct) / 100),
              }}
            >
              <RangeSlider
                ariaLabel="Shadow opacity"
                min={0.05}
                max={0.85}
                step={0.05}
                value={config.shadowOpacity}
                onChange={(v) => update('shadowOpacity', v)}
              />
            </Field>
          </div>
        )}
      </div>
    </Card>
  );
}

export function BackgroundControls({ config, onChange }: StyleControlsProps) {
  const update = <K extends keyof IconConfig>(key: K, value: IconConfig[K]) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const resetBackground = () => {
    onChange((prev) => ({
      ...prev,
      bgType: DEFAULT_ICON_CONFIG.bgType,
      bgColor: DEFAULT_ICON_CONFIG.bgColor,
      gradientStart: DEFAULT_ICON_CONFIG.gradientStart,
      gradientEnd: DEFAULT_ICON_CONFIG.gradientEnd,
      gradientAngle: DEFAULT_ICON_CONFIG.gradientAngle,
    }));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        icon={<Palette className="h-4 w-4" />}
        title="Background"
        action={
          <Button size="xs" variant="ghost" icon={<RotateCcw />} onClick={resetBackground}>
            Reset
          </Button>
        }
      />
      <div className="p-4 gap-3 flex-1 flex flex-col justify-between">
        <SegmentedControl<BgType>
          fullWidth
          value={config.bgType}
          onChange={(bgType) => update('bgType', bgType)}
          options={[
            { value: 'solid', label: 'Solid' },
            { value: 'gradient', label: 'Gradient' },
            { value: 'transparent', label: 'None' },
          ]}
        />

        <div className="grid grid-cols-[minmax(0,1fr)] flex-1 items-stretch">
          {/* Solid mode: 2 balanced rows matching Gradient mode */}
          <div
            aria-hidden={config.bgType !== 'solid'}
            className={
              config.bgType === 'solid'
                ? 'col-start-1 row-start-1 flex flex-col justify-between gap-2.5'
                : 'col-start-1 row-start-1 flex flex-col justify-between gap-2.5 opacity-0 invisible pointer-events-none select-none'
            }
          >
            <Field
              label="Color"
              valueDisplay={config.bgColor.toUpperCase()}
              colorEdit={{
                value: config.bgColor,
                onChange: (hex) => update('bgColor', hex),
              }}
            >
              <input
                type="color"
                aria-label="Background color"
                value={config.bgColor}
                onChange={(e) => update('bgColor', e.target.value)}
                className="h-8 w-full cursor-pointer rounded-md border border-border bg-surface p-1"
              />
            </Field>

            <Field label="Palette presets">
              <div className="grid grid-cols-10 gap-1.5 h-5 items-center">
                {COLOR_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    aria-label={`Select ${hex}`}
                    onClick={() => update('bgColor', hex)}
                    className="h-5 w-full rounded-md border border-border-strong transition-transform hover:scale-105 cursor-pointer"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </Field>
          </div>

          {/* Gradient mode: 2 balanced rows */}
          <div
            aria-hidden={config.bgType !== 'gradient'}
            className={
              config.bgType === 'gradient'
                ? 'col-start-1 row-start-1 flex flex-col justify-between gap-2.5'
                : 'col-start-1 row-start-1 flex flex-col justify-between gap-2.5 opacity-0 invisible pointer-events-none select-none'
            }
          >
            <div className="grid grid-cols-2 gap-2.5">
              <Field
                label="Start"
                valueDisplay={config.gradientStart.toUpperCase()}
                colorEdit={{
                  value: config.gradientStart,
                  onChange: (hex) => update('gradientStart', hex),
                }}
              >
                <input
                  type="color"
                  aria-label="Gradient start color"
                  value={config.gradientStart}
                  onChange={(e) => update('gradientStart', e.target.value)}
                  className="h-8 w-full cursor-pointer rounded-md border border-border bg-surface p-1"
                />
              </Field>
              <Field
                label="End"
                valueDisplay={config.gradientEnd.toUpperCase()}
                colorEdit={{
                  value: config.gradientEnd,
                  onChange: (hex) => update('gradientEnd', hex),
                }}
              >
                <input
                  type="color"
                  aria-label="Gradient end color"
                  value={config.gradientEnd}
                  onChange={(e) => update('gradientEnd', e.target.value)}
                  className="h-8 w-full cursor-pointer rounded-md border border-border bg-surface p-1"
                />
              </Field>
            </div>
            <Field
              label="Angle"
              valueDisplay={`${config.gradientAngle}°`}
              numericEdit={{
                value: config.gradientAngle,
                min: 0,
                max: 360,
                step: 1,
                onChange: (v) => update('gradientAngle', Math.round(v)),
              }}
            >
              <RangeSlider
                ariaLabel="Gradient angle"
                min={0}
                max={360}
                step={5}
                value={config.gradientAngle}
                onChange={(v) => update('gradientAngle', v)}
              />
            </Field>
          </div>

          {/* Transparent / None mode */}
          <div
            aria-hidden={config.bgType !== 'transparent'}
            className={
              config.bgType === 'transparent'
                ? 'col-start-1 row-start-1 flex items-center justify-center rounded-lg border border-dashed border-border checkerboard text-[12px] font-medium text-muted'
                : 'col-start-1 row-start-1 flex items-center justify-center rounded-lg border border-dashed border-border checkerboard text-[12px] font-medium text-muted opacity-0 invisible pointer-events-none select-none'
            }
          >
            <span className="rounded-md bg-surface/90 px-2.5 py-1 border border-border shadow-card">
              Transparent alpha background
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function StyleControls({
  asset,
  config,
  onChange,
}: StyleControlsProps & { asset: UploadedAsset }) {
  return (
    <div className="space-y-3">
      <ShapeAndArtworkControls asset={asset} config={config} onChange={onChange} />
      <BackgroundControls config={config} onChange={onChange} />
    </div>
  );
}
