import type { IconConfig, UploadedAsset } from './types';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function getEffectiveRadiusPx(config: IconConfig, size: number): number {
  if (config.shapePreset === 'square') return 0;
  if (config.shapePreset === 'circle') return size / 2;
  if (config.shapePreset === 'squircle') return 0.24 * size;
  const clamped = Math.max(0, Math.min(50, config.cornerRadius));
  return (clamped / 100) * size;
}

/**
 * Generates an SVG path for a squircle (continuous corner) or standard rounded rect.
 */
export function buildShapePathD(size: number, config: IconConfig, inset = 0): string {
  const s = size - inset * 2;
  const x = inset;
  const y = inset;

  if (config.shapePreset === 'circle') {
    const r = s / 2;
    const cx = x + r;
    const cy = y + r;
    return `M ${cx} ${y} A ${r} ${r} 0 1 1 ${cx - 0.001} ${y} Z`;
  }

  const rawR = getEffectiveRadiusPx(config, size) - inset;
  const r = Math.max(0, Math.min(s / 2, rawR));
  if (r <= 0.01) {
    return `M ${x} ${y} H ${x + s} V ${y + s} H ${x} Z`;
  }

  if (config.shapePreset === 'squircle') {
    // Smooth Apple-style continuous corner approximation
    const c = r * 0.45;
    const ext = Math.min(s / 2, r * 1.15);
    return [
      `M ${x + ext} ${y}`,
      `H ${x + s - ext}`,
      `C ${x + s - c} ${y} ${x + s} ${y + c} ${x + s} ${y + ext}`,
      `V ${y + s - ext}`,
      `C ${x + s} ${y + s - c} ${x + s - c} ${y + s} ${x + s - ext} ${y + s}`,
      `H ${x + ext}`,
      `C ${x + c} ${y + s} ${x} ${y + s - c} ${x} ${y + s - ext}`,
      `V ${y + ext}`,
      `C ${x} ${y + c} ${x + c} ${y} ${x + ext} ${y}`,
      'Z',
    ].join(' ');
  }

  // Standard rounded rectangle
  return [
    `M ${x + r} ${y}`,
    `H ${x + s - r}`,
    `A ${r} ${r} 0 0 1 ${x + s} ${y + r}`,
    `V ${y + s - r}`,
    `A ${r} ${r} 0 0 1 ${x + s - r} ${y + s}`,
    `H ${x + r}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + s - r}`,
    `V ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    'Z',
  ].join(' ');
}

function traceShapeOnCanvas(
  ctx: CanvasRenderingContext2D,
  size: number,
  config: IconConfig,
  inset = 0,
): void {
  const s = size - inset * 2;
  const x = inset;
  const y = inset;

  ctx.beginPath();
  if (config.shapePreset === 'circle') {
    ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
    ctx.closePath();
    return;
  }

  const rawR = getEffectiveRadiusPx(config, size) - inset;
  const r = Math.max(0, Math.min(s / 2, rawR));
  if (r <= 0.01) {
    ctx.rect(x, y, s, s);
    ctx.closePath();
    return;
  }

  if (config.shapePreset === 'squircle') {
    const c = r * 0.45;
    const ext = Math.min(s / 2, r * 1.15);
    ctx.moveTo(x + ext, y);
    ctx.lineTo(x + s - ext, y);
    ctx.bezierCurveTo(x + s - c, y, x + s, y + c, x + s, y + ext);
    ctx.lineTo(x + s, y + s - ext);
    ctx.bezierCurveTo(x + s, y + s - c, x + s - c, y + s, x + s - ext, y + s);
    ctx.lineTo(x + ext, y + s);
    ctx.bezierCurveTo(x + c, y + s, x, y + s - c, x, y + s - ext);
    ctx.lineTo(x, y + ext);
    ctx.bezierCurveTo(x, y + c, x + c, y, x + ext, y);
    ctx.closePath();
    return;
  }

  ctx.roundRect(x, y, s, s, r);
  ctx.closePath();
}

function fillBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  config: IconConfig,
): void {
  if (config.bgType === 'transparent') return;

  if (config.bgType === 'solid') {
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, size, size);
    return;
  }

  const rad = ((config.gradientAngle - 90) * Math.PI) / 180;
  const cx = size / 2;
  const cy = size / 2;
  const halfLen = (Math.abs(Math.cos(rad)) + Math.abs(Math.sin(rad))) * (size / 2);
  const x0 = cx - Math.cos(rad) * halfLen;
  const y0 = cy - Math.sin(rad) * halfLen;
  const x1 = cx + Math.cos(rad) * halfLen;
  const y1 = cy + Math.sin(rad) * halfLen;

  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0, config.gradientStart);
  grad.addColorStop(1, config.gradientEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
}

/**
 * Recolors an SVG string to a single solid hex/CSS color while preserving `none` fills/strokes.
 */
export function applySvgTint(rawSvg: string, tintColor: string): string {
  // Replace explicit fill="..." and stroke="..." attributes unless they are "none" or "url(...)"
  const replaceColorAttr = (markup: string, attr: 'fill' | 'stroke'): string => {
    const regex = new RegExp(`(\\b${attr}\\s*=\\s*["'])([^"']+)(["'])`, 'gi');
    return markup.replace(regex, (full, prefix: string, val: string, suffix: string) => {
      const trimmed = val.trim().toLowerCase();
      if (trimmed === 'none' || trimmed === 'transparent' || trimmed.startsWith('url(')) {
        return full;
      }
      return `${prefix}${tintColor}${suffix}`;
    });
  };

  let tinted = replaceColorAttr(rawSvg, 'fill');
  tinted = replaceColorAttr(tinted, 'stroke');

  // Also replace inline style fill:... and stroke:... unless none/transparent/url()
  tinted = tinted.replace(
    /\b(fill|stroke)\s*:\s*([^;}"']+)/gi,
    (full, prop: string, val: string) => {
      const trimmed = val.trim().toLowerCase();
      if (trimmed === 'none' || trimmed === 'transparent' || trimmed.startsWith('url(')) {
        return full;
      }
      return `${prop}: ${tintColor}`;
    },
  );

  // Ensure root <svg> has color="<tintColor>" and if root fill isn't "none", set fill="<tintColor>"
  tinted = tinted.replace(/<svg\b([^>]*)>/i, (full, attrs: string) => {
    const hasFillNone = /\bfill\s*=\s*["']none["']/i.test(attrs);
    let updatedAttrs = attrs.replace(/\bcolor\s*=\s*["'][^"']*["']/gi, '');
    if (!hasFillNone && !/\bfill\s*=/i.test(updatedAttrs)) {
      updatedAttrs += ` fill="${tintColor}"`;
    }
    updatedAttrs += ` color="${tintColor}"`;
    return `<svg${updatedAttrs}>`;
  });

  return tinted;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

function getEffectiveAssetDataUrl(asset: UploadedAsset, config: IconConfig): string {
  if (asset.kind === 'svg' && asset.rawSvg && config.tintMode === 'solid') {
    const tintedSvg = applySvgTint(asset.rawSvg, config.tintColor);
    const encoded =
      typeof btoa !== 'undefined'
        ? btoa(unescape(encodeURIComponent(tintedSvg)))
        : Buffer.from(tintedSvg, 'utf-8').toString('base64');
    return `data:image/svg+xml;base64,${encoded}`;
  }
  return asset.dataUrl;
}

export async function renderIconToCanvas(
  asset: UploadedAsset,
  config: IconConfig,
  size: number,
  options?: { overrideShape?: 'square' },
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas context');

  const effectiveConfig: IconConfig = options?.overrideShape === 'square'
    ? { ...config, shapePreset: 'square', cornerRadius: 0 }
    : config;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  traceShapeOnCanvas(ctx, size, effectiveConfig, 0);
  ctx.clip();

  fillBackground(ctx, size, effectiveConfig);

  const img = await loadImage(getEffectiveAssetDataUrl(asset, effectiveConfig));
  const aspect = asset.width > 0 && asset.height > 0 ? asset.width / asset.height : 1;
  const baseW = aspect >= 1 ? size : size * aspect;
  const baseH = aspect >= 1 ? size / aspect : size;
  const drawW = baseW * effectiveConfig.scale;
  const drawH = baseH * effectiveConfig.scale;

  const cx = size / 2 + (effectiveConfig.offsetX / 100) * size;
  const cy = size / 2 + (effectiveConfig.offsetY / 100) * size;

  ctx.save();
  if (effectiveConfig.shadowMode === 'soft' && effectiveConfig.shadowOpacity > 0) {
    ctx.shadowColor = hexToRgba(effectiveConfig.shadowColor || '#000000', effectiveConfig.shadowOpacity);
    ctx.shadowBlur = (effectiveConfig.shadowBlur / 100) * size;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = (effectiveConfig.shadowOffsetY / 100) * size;
  }
  ctx.translate(cx, cy);
  ctx.rotate((effectiveConfig.rotation * Math.PI) / 180);
  ctx.scale(effectiveConfig.flipX ? -1 : 1, effectiveConfig.flipY ? -1 : 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // Inner border rendered cleanly inside the clipped shape
  if (
    effectiveConfig.borderType !== 'none' &&
    effectiveConfig.borderWidth > 0 &&
    effectiveConfig.borderOpacity > 0
  ) {
    const strokePx = (effectiveConfig.borderWidth / 100) * size;
    ctx.save();
    ctx.globalAlpha = effectiveConfig.borderOpacity;
    ctx.strokeStyle = effectiveConfig.borderColor;
    ctx.lineWidth = strokePx;
    traceShapeOnCanvas(ctx, size, effectiveConfig, strokePx / 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
  return canvas;
}

export async function renderIconToPngBlob(
  asset: UploadedAsset,
  config: IconConfig,
  size: number,
  options?: { overrideShape?: 'square' },
): Promise<Blob> {
  const canvas = await renderIconToCanvas(asset, config, size, options);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode PNG blob'));
    }, 'image/png');
  });
}

export async function renderIconToPngBytes(
  asset: UploadedAsset,
  config: IconConfig,
  size: number,
): Promise<Uint8Array> {
  const blob = await renderIconToPngBlob(asset, config, size);
  const buf = await blob.arrayBuffer();
  return new Uint8Array(buf);
}

/**
 * Extracts viewBox and inner SVG markup from a raw SVG string.
 * Works in both browser and Node/Vitest environments without requiring DOMParser.
 */
const PRESERVED_SVG_ATTRS = [
  'fill',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'fill-rule',
  'clip-rule',
  'color',
] as const;

export function extractSvgParts(rawSvg: string, fallbackW: number, fallbackH: number): {
  viewBox: string;
  innerContent: string;
  presentationAttrs: string;
} {
  const openTagMatch = rawSvg.match(/<svg\b([^>]*)>/i);
  const closeTagIndex = rawSvg.toLowerCase().lastIndexOf('</svg>');

  if (!openTagMatch || closeTagIndex === -1) {
    return {
      viewBox: `0 0 ${fallbackW || 100} ${fallbackH || 100}`,
      innerContent: rawSvg,
      presentationAttrs: 'fill="black"',
    };
  }

  const attrs = openTagMatch[1];
  const viewBoxMatch = attrs.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  const widthMatch = attrs.match(/\bwidth\s*=\s*["']([0-9.]+)(?:px)?["']/i);
  const heightMatch = attrs.match(/\bheight\s*=\s*["']([0-9.]+)(?:px)?["']/i);

  const w = widthMatch ? parseFloat(widthMatch[1]) : fallbackW || 100;
  const h = heightMatch ? parseFloat(heightMatch[1]) : fallbackH || 100;
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${w} ${h}`;

  const keptAttrs: string[] = [];
  let hasFill = false;
  for (const name of PRESERVED_SVG_ATTRS) {
    const match = attrs.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
    if (match) {
      if (name === 'fill') hasFill = true;
      keptAttrs.push(`${name}="${match[1]}"`);
    }
  }
  if (!hasFill) {
    // SVG elements default to fill="black"; set explicitly so outer styles cannot override it
    keptAttrs.unshift('fill="black"');
  }

  const startIdx = (openTagMatch.index ?? 0) + openTagMatch[0].length;
  const innerContent = rawSvg.slice(startIdx, closeTagIndex).trim();

  return { viewBox, innerContent, presentationAttrs: keptAttrs.join(' ') };
}

export function renderIconToSvgString(
  asset: UploadedAsset,
  config: IconConfig,
  size = 512,
): string {
  const clipPathD = buildShapePathD(size, config, 0);
  const strokePx = config.borderType === 'none' ? 0 : (config.borderWidth / 100) * size;
  const borderPathD = strokePx > 0 ? buildShapePathD(size, config, strokePx / 2) : '';

  const rad = ((config.gradientAngle - 90) * Math.PI) / 180;
  const x1 = (50 - Math.cos(rad) * 50).toFixed(2);
  const y1 = (50 - Math.sin(rad) * 50).toFixed(2);
  const x2 = (50 + Math.cos(rad) * 50).toFixed(2);
  const y2 = (50 + Math.sin(rad) * 50).toFixed(2);

  const aspect = asset.width > 0 && asset.height > 0 ? asset.width / asset.height : 1;
  const baseW = aspect >= 1 ? size : size * aspect;
  const baseH = aspect >= 1 ? size / aspect : size;
  const drawW = baseW * config.scale;
  const drawH = baseH * config.scale;

  const cx = size / 2 + (config.offsetX / 100) * size;
  const cy = size / 2 + (config.offsetY / 100) * size;

  const defsParts: string[] = [
    `<clipPath id="favify-clip"><path d="${clipPathD}" /></clipPath>`,
  ];

  let bgRect = '';
  if (config.bgType === 'solid') {
    bgRect = `<rect width="${size}" height="${size}" fill="${config.bgColor}" />`;
  } else if (config.bgType === 'gradient') {
    defsParts.push(
      `<linearGradient id="favify-bg-grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">` +
        `<stop offset="0%" stop-color="${config.gradientStart}" />` +
        `<stop offset="100%" stop-color="${config.gradientEnd}" />` +
      `</linearGradient>`,
    );
    bgRect = `<rect width="${size}" height="${size}" fill="url(#favify-bg-grad)" />`;
  }

  const sx = config.flipX ? -1 : 1;
  const sy = config.flipY ? -1 : 1;
  const groupTransform = `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${config.rotation}) scale(${sx} ${sy}) translate(${(-drawW / 2).toFixed(2)} ${(-drawH / 2).toFixed(2)})`;

  let filterAttr = '';
  if (config.shadowMode === 'soft' && config.shadowOpacity > 0) {
    const dyPx = ((config.shadowOffsetY / 100) * size).toFixed(2);
    const stdDev = (((config.shadowBlur / 100) * size) / 2).toFixed(2);
    defsParts.push(
      `<filter id="favify-shadow" x="-30%" y="-30%" width="160%" height="160%">` +
        `<feDropShadow dx="0" dy="${dyPx}" stdDeviation="${stdDev}" flood-color="${config.shadowColor || '#000000'}" flood-opacity="${config.shadowOpacity}" />` +
      `</filter>`,
    );
    filterAttr = ` filter="url(#favify-shadow)"`;
  }

  let artworkNode = '';
  if (asset.kind === 'svg' && asset.rawSvg) {
    const sourceSvg =
      config.tintMode === 'solid' ? applySvgTint(asset.rawSvg, config.tintColor) : asset.rawSvg;
    const { viewBox, innerContent, presentationAttrs } = extractSvgParts(
      sourceSvg,
      asset.width,
      asset.height,
    );
    artworkNode =
      `<g transform="${groupTransform}"${filterAttr}>` +
        `<svg width="${drawW.toFixed(2)}" height="${drawH.toFixed(2)}" viewBox="${viewBox}" overflow="visible" ${presentationAttrs}>` +
          `${innerContent}` +
        `</svg>` +
      `</g>`;
  } else {
    artworkNode =
      `<g transform="${groupTransform}"${filterAttr}>` +
        `<image href="${asset.dataUrl}" width="${drawW.toFixed(2)}" height="${drawH.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />` +
      `</g>`;
  }

  const borderNode =
    strokePx > 0 && config.borderOpacity > 0
      ? `<path d="${borderPathD}" fill="none" stroke="${config.borderColor}" stroke-width="${strokePx.toFixed(2)}" stroke-opacity="${config.borderOpacity}" />`
      : '';

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `  <defs>`,
    ...defsParts.map((d) => `    ${d}`),
    `  </defs>`,
    `  <g clip-path="url(#favify-clip)">`,
    bgRect ? `    ${bgRect}` : '',
    `    ${artworkNode}`,
    borderNode ? `    ${borderNode}` : '',
    `  </g>`,
    `</svg>`,
  ]
    .filter(Boolean)
    .join('\n');
}
