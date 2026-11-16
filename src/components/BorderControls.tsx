'use client';

import { Frame, RotateCcw } from 'lucide-react';
import { DEFAULT_ICON_CONFIG, type BorderType, type IconConfig } from '@/lib/types';
import {
  Button,
  Card,
  CardHeader,
  Field,
  RangeSlider,
  SegmentedControl,
} from './ui/primitives';

interface BorderControlsProps {
  config: IconConfig;
  onChange: (updater: (prev: IconConfig) => IconConfig) => void;
}

const BORDER_SWATCHES = ['#ffffff', '#16161d', '#4f46e5', '#a5b4fc', '#e5e5ea'];

export function BorderControls({ config, onChange }: BorderControlsProps) {
  const update = <K extends keyof IconConfig>(key: K, value: IconConfig[K]) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    onChange((prev) => ({
      ...prev,
      borderType: DEFAULT_ICON_CONFIG.borderType,
      borderWidth: DEFAULT_ICON_CONFIG.borderWidth,
      borderColor: DEFAULT_ICON_CONFIG.borderColor,
      borderOpacity: DEFAULT_ICON_CONFIG.borderOpacity,
    }));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        icon={<Frame className="h-4 w-4" />}
        title="Border"
        action={
          <Button size="xs" variant="ghost" icon={<RotateCcw />} onClick={handleReset}>
            Reset
          </Button>
        }
      />
      <div className="p-4 gap-3 flex-1 flex flex-col justify-between">
        <SegmentedControl<BorderType>
          fullWidth
          value={config.borderType}
          onChange={(borderType) => update('borderType', borderType)}
          options={[
            { value: 'solid', label: 'Solid' },
            { value: 'none', label: 'None' },
          ]}
        />

        <div className="grid grid-cols-[minmax(0,1fr)] flex-1 items-stretch">
          <div
            aria-hidden={config.borderType !== 'solid'}
            className={
              config.borderType === 'solid'
                ? 'col-start-1 row-start-1 flex flex-col justify-between gap-2.5'
                : 'col-start-1 row-start-1 flex flex-col justify-between gap-2.5 opacity-0 invisible pointer-events-none select-none'
            }
          >
            <Field
              label="Width"
              valueDisplay={`${config.borderWidth.toFixed(1)}%`}
              numericEdit={{
                value: config.borderWidth,
                min: 0.5,
                max: 12,
                step: 0.5,
                onChange: (v) => update('borderWidth', Math.round(v * 10) / 10),
              }}
            >
              <RangeSlider
                ariaLabel="Border width"
                min={0.5}
                max={12}
                step={0.5}
                value={config.borderWidth}
                onChange={(v) => update('borderWidth', v)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3 items-start">
              <Field
                label="Color"
                valueDisplay={config.borderColor.toUpperCase()}
                colorEdit={{
                  value: config.borderColor,
                  onChange: (hex) => update('borderColor', hex),
                }}
              >
                <div className="flex h-8 items-center gap-2">
                  <input
                    type="color"
                    aria-label="Border color"
                    value={config.borderColor}
                    onChange={(e) => update('borderColor', e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-md border border-border bg-surface p-1 shrink-0"
                  />
                  <div className="flex flex-1 items-center justify-between gap-1">
                    {BORDER_SWATCHES.slice(0, 4).map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        aria-label={`Border ${hex}`}
                        onClick={() => update('borderColor', hex)}
                        className="h-4 w-4 rounded-full border border-border-strong transition-transform hover:scale-110 cursor-pointer shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </Field>

              <Field
                label="Opacity"
                valueDisplay={`${Math.round(config.borderOpacity * 100)}%`}
                numericEdit={{
                  value: Math.round(config.borderOpacity * 100),
                  min: 5,
                  max: 100,
                  step: 5,
                  onChange: (pct) => update('borderOpacity', Math.round(pct) / 100),
                }}
              >
                <div className="flex h-8 items-center">
                  <RangeSlider
                    ariaLabel="Border opacity"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={config.borderOpacity}
                    onChange={(v) => update('borderOpacity', v)}
                  />
                </div>
              </Field>
            </div>
          </div>

          <div
            aria-hidden={config.borderType !== 'none'}
            className={
              config.borderType === 'none'
                ? 'col-start-1 row-start-1 flex items-center justify-center rounded-lg border border-dashed border-border bg-surface-2/40 text-[12px] text-muted'
                : 'col-start-1 row-start-1 flex items-center justify-center rounded-lg border border-dashed border-border bg-surface-2/40 text-[12px] text-muted opacity-0 invisible pointer-events-none select-none'
            }
          >
            No inner border applied
          </div>
        </div>
      </div>
    </Card>
  );
}
