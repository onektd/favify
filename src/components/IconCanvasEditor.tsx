'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Move } from 'lucide-react';
import { renderIconToCanvas } from '@/lib/iconRenderer';
import type { IconConfig, UploadedAsset } from '@/lib/types';
import { Card, CardHeader, InlineEditableValue, Switch } from './ui/primitives';

interface IconCanvasEditorProps {
  asset: UploadedAsset;
  config: IconConfig;
  onChange: (updater: (prev: IconConfig) => IconConfig) => void;
}

const GRID_SNAP_STEP_PCT = 5;

export function IconCanvasEditor({
  asset,
  config,
  onChange,
}: IconCanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  const [showGuides, setShowGuides] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Native non-passive wheel listener so scrolling over the editor zooms the icon without scrolling the page
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const handleNativeWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.04 : 0.04;
      onChangeRef.current((prev) => ({
        ...prev,
        scale: Math.max(0.2, Math.min(2.4, Math.round((prev.scale + delta) * 100) / 100)),
      }));
    };
    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const target = canvasRef.current;
    if (!target) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const renderSize = 340 * dpr;

    renderIconToCanvas(asset, config, renderSize).then((offscreen) => {
      if (cancelled || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      canvasRef.current.width = renderSize;
      canvasRef.current.height = renderSize;
      ctx.clearRect(0, 0, renderSize, renderSize);
      ctx.drawImage(offscreen, 0, 0);
    });

    return () => {
      cancelled = true;
    };
  }, [asset, config]);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startOffsetX: config.offsetX,
      startOffsetY: config.offsetY,
    };
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dxPct = ((e.clientX - start.clientX) / rect.width) * 100;
    const dyPct = ((e.clientY - start.clientY) / rect.height) * 100;

    let nextX = Math.max(-80, Math.min(80, Math.round((start.startOffsetX + dxPct) * 10) / 10));
    let nextY = Math.max(-80, Math.min(80, Math.round((start.startOffsetY + dyPct) * 10) / 10));

    if (snapEnabled) {
      nextX = Math.round(nextX / GRID_SNAP_STEP_PCT) * GRID_SNAP_STEP_PCT;
      nextY = Math.round(nextY / GRID_SNAP_STEP_PCT) * GRID_SNAP_STEP_PCT;
    }

    onChange((prev) => ({
      ...prev,
      offsetX: nextX,
      offsetY: nextY,
    }));
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
    setDragging(false);
  };

  const snappedX = snapEnabled && dragging && config.offsetX === 0;
  const snappedY = snapEnabled && dragging && config.offsetY === 0;

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader
        icon={<Move className="h-4 w-4" />}
        title="Icon editor"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-[12px] text-muted cursor-pointer">
              <span>Safe zone</span>
              <Switch
                checked={showSafeZone}
                onChange={setShowSafeZone}
                label="Toggle Android 80% maskable safe-zone overlay"
              />
            </label>
            <label className="flex items-center gap-1.5 text-[12px] text-muted cursor-pointer">
              <span>Grid</span>
              <Switch checked={snapEnabled} onChange={setSnapEnabled} label="Toggle 5% grid snapping" />
            </label>
            <label className="flex items-center gap-1.5 text-[12px] text-muted cursor-pointer">
              <span>Guides</span>
              <Switch checked={showGuides} onChange={setShowGuides} label="Toggle editor guides" />
            </label>
          </div>
        }
      />

      <div ref={stageRef} className="p-4 flex-1 flex flex-col items-center justify-center bg-surface-2/40">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative aspect-square w-[clamp(220px,34vh,320px)] rounded-xl checkerboard border border-border shadow-card select-none touch-none overflow-hidden ${
            dragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <canvas ref={canvasRef} className="h-full w-full block" />

          {/* Subtle 10% snap grid when Grid snap is enabled */}
          {snapEnabled && (
            <div
              className="pointer-events-none absolute inset-0 opacity-35"
              style={{
                backgroundImage:
                  'linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)',
                backgroundSize: '10% 10%',
                opacity: 0.12,
              }}
            />
          )}

          {(showGuides || snappedX || snappedY) && (
            <div className="pointer-events-none absolute inset-0">
              {(showGuides || snappedX) && (
                <div
                  className={`absolute left-1/2 top-0 bottom-0 transition-colors ${
                    snappedX ? 'w-[1.5px] bg-primary' : 'w-px bg-primary/25'
                  }`}
                />
              )}
              {(showGuides || snappedY) && (
                <div
                  className={`absolute top-1/2 left-0 right-0 transition-colors ${
                    snappedY ? 'h-[1.5px] bg-primary' : 'h-px bg-primary/25'
                  }`}
                />
              )}
              {showGuides && (
                <div className="absolute inset-[10%] rounded-full border border-dashed border-primary/35" />
              )}
            </div>
          )}

          {/* Android 80% Maskable Safe-Zone Overlay */}
          {showSafeZone && (
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute inset-[10%] rounded-full border-2 border-amber-400/90"
                style={{
                  boxShadow: '0 0 0 999px rgba(10, 10, 14, 0.42)',
                }}
              />
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-2 py-0.5 font-mono text-[10px] font-medium text-amber-300 shadow-sm whitespace-nowrap">
                Maskable safe zone (80%)
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 font-mono tabular-nums text-[11px] text-muted">
          <span className="inline-flex items-center gap-1">
            X:
            <InlineEditableValue
              display={`${config.offsetX.toFixed(1)}%`}
              numericEdit={{
                value: config.offsetX,
                min: -80,
                max: 80,
                step: 0.5,
                onChange: (v) => onChange((prev) => ({ ...prev, offsetX: Math.round(v * 10) / 10 })),
              }}
            />
          </span>
          <span className="inline-flex items-center gap-1">
            Y:
            <InlineEditableValue
              display={`${config.offsetY.toFixed(1)}%`}
              numericEdit={{
                value: config.offsetY,
                min: -80,
                max: 80,
                step: 0.5,
                onChange: (v) => onChange((prev) => ({ ...prev, offsetY: Math.round(v * 10) / 10 })),
              }}
            />
          </span>
          <span className="inline-flex items-center gap-1">
            Scale:
            <InlineEditableValue
              display={`${Math.round(config.scale * 100)}%`}
              numericEdit={{
                value: Math.round(config.scale * 100),
                min: 20,
                max: 240,
                step: 1,
                onChange: (pct) => onChange((prev) => ({ ...prev, scale: Math.round(pct) / 100 })),
              }}
            />
          </span>
          <span className="inline-flex items-center gap-1">
            Angle:
            <InlineEditableValue
              display={`${config.rotation}°`}
              numericEdit={{
                value: config.rotation,
                min: -180,
                max: 180,
                step: 1,
                onChange: (deg) => onChange((prev) => ({ ...prev, rotation: Math.round(deg) })),
              }}
            />
          </span>
        </div>
      </div>
    </Card>
  );
}
