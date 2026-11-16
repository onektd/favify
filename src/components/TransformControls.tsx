'use client';

import {
  Crosshair,
  FlipHorizontal2,
  FlipVertical2,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
} from 'lucide-react';
import { DEFAULT_ICON_CONFIG, type IconConfig } from '@/lib/types';
import { Button, Card, CardHeader, Field, RangeSlider } from './ui/primitives';

interface TransformControlsProps {
  config: IconConfig;
  onChange: (updater: (prev: IconConfig) => IconConfig) => void;
}

export function TransformControls({ config, onChange }: TransformControlsProps) {
  const handleCenter = () => {
    onChange((prev) => ({
      ...prev,
      offsetX: 0,
      offsetY: 0,
    }));
  };

  const handleRotate90 = () => {
    onChange((prev) => {
      const next = ((prev.rotation + 90 + 180) % 360) - 180;
      return { ...prev, rotation: next === -180 ? 180 : next };
    });
  };

  const handleReset = () => {
    onChange((prev) => ({
      ...prev,
      offsetX: DEFAULT_ICON_CONFIG.offsetX,
      offsetY: DEFAULT_ICON_CONFIG.offsetY,
      scale: DEFAULT_ICON_CONFIG.scale,
      rotation: DEFAULT_ICON_CONFIG.rotation,
      flipX: DEFAULT_ICON_CONFIG.flipX,
      flipY: DEFAULT_ICON_CONFIG.flipY,
    }));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        icon={<SlidersHorizontal className="h-4 w-4" />}
        title="Position & scale"
        action={
          <Button size="xs" variant="ghost" icon={<RotateCcw />} onClick={handleReset}>
            Reset
          </Button>
        }
      />
      <div className="p-4 gap-3 flex-1 min-h-[168px] flex flex-col justify-between">
        <Field
          label="Scale"
          valueDisplay={`${Math.round(config.scale * 100)}%`}
          numericEdit={{
            value: Math.round(config.scale * 100),
            min: 20,
            max: 240,
            step: 1,
            onChange: (pct) => onChange((prev) => ({ ...prev, scale: Math.round(pct) / 100 })),
          }}
        >
          <RangeSlider
            ariaLabel="Icon scale"
            min={0.2}
            max={2.4}
            step={0.02}
            value={config.scale}
            onChange={(v) => onChange((prev) => ({ ...prev, scale: v }))}
          />
        </Field>

        <Field
          label="Rotation"
          valueDisplay={`${config.rotation}°`}
          numericEdit={{
            value: config.rotation,
            min: -180,
            max: 180,
            step: 1,
            onChange: (deg) => onChange((prev) => ({ ...prev, rotation: Math.round(deg) })),
          }}
        >
          <RangeSlider
            ariaLabel="Icon rotation"
            min={-180}
            max={180}
            step={1}
            value={config.rotation}
            onChange={(v) => onChange((prev) => ({ ...prev, rotation: v }))}
          />
        </Field>

        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handleCenter}
            title="Center icon (X: 0%, Y: 0%)"
            className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg border border-border bg-surface px-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-surface-2 cursor-pointer select-none whitespace-nowrap"
          >
            <Crosshair className="h-3.5 w-3.5 text-muted shrink-0" />
            <span>Center</span>
          </button>
          <button
            type="button"
            onClick={() => onChange((prev) => ({ ...prev, flipX: !prev.flipX }))}
            title="Flip horizontally"
            className={`inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg border px-1.5 text-[12px] font-medium transition-colors cursor-pointer select-none whitespace-nowrap ${
              config.flipX
                ? 'border-primary bg-primary text-primary-fg shadow-card'
                : 'border-border bg-surface text-fg hover:bg-surface-2'
            }`}
          >
            <FlipHorizontal2 className="h-3.5 w-3.5 shrink-0" />
            <span>Flip H</span>
          </button>
          <button
            type="button"
            onClick={() => onChange((prev) => ({ ...prev, flipY: !prev.flipY }))}
            title="Flip vertically"
            className={`inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg border px-1.5 text-[12px] font-medium transition-colors cursor-pointer select-none whitespace-nowrap ${
              config.flipY
                ? 'border-primary bg-primary text-primary-fg shadow-card'
                : 'border-border bg-surface text-fg hover:bg-surface-2'
            }`}
          >
            <FlipVertical2 className="h-3.5 w-3.5 shrink-0" />
            <span>Flip V</span>
          </button>
          <button
            type="button"
            onClick={handleRotate90}
            title="Rotate +90°"
            className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-lg border border-border bg-surface px-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-surface-2 cursor-pointer select-none whitespace-nowrap"
          >
            <RotateCw className="h-3.5 w-3.5 text-muted shrink-0" />
            <span>+90°</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
