import type { UploadedAsset } from './types';

export type MonogramFontId = 'sans' | 'mono' | 'serif' | 'rounded';
export type MonogramWeight = '600' | '700' | '800';

export interface MonogramOptions {
  text: string;
  fontId: MonogramFontId;
  fontWeight: MonogramWeight;
  color: string;
  italic?: boolean;
}

export const MONOGRAM_FONTS: Array<{
  id: MonogramFontId;
  label: string;
  family: string;
}> = [
  {
    id: 'sans',
    label: 'Sans',
    family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    id: 'mono',
    label: 'Mono',
    family: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  {
    id: 'serif',
    label: 'Serif',
    family: 'Georgia, Cambria, "Times New Roman", Times, serif',
  },
  {
    id: 'rounded',
    label: 'Round',
    family: 'ui-rounded, "SF Pro Rounded", "Hiragino Maru Gothic ProN", Quicksand, sans-serif',
  },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function svgStringToUploadedAsset(rawSvg: string, fileName: string, size = 120): UploadedAsset {
  const encoded =
    typeof btoa !== 'undefined'
      ? btoa(unescape(encodeURIComponent(rawSvg)))
      : Buffer.from(rawSvg, 'utf-8').toString('base64');
  return {
    kind: 'svg',
    dataUrl: `data:image/svg+xml;base64,${encoded}`,
    rawSvg,
    width: size,
    height: size,
    fileName,
  };
}

export function buildMonogramSvg(options: MonogramOptions): string {
  const cleanText = (options.text || 'F').slice(0, 3);
  const len = Array.from(cleanText).length;
  const fontSize = len <= 1 ? 72 : len === 2 ? 56 : 42;
  const fontEntry = MONOGRAM_FONTS.find((f) => f.id === options.fontId) ?? MONOGRAM_FONTS[0];
  const fontStyle = options.italic ? 'italic' : 'normal';
  const letterSpacing = len >= 2 ? '-0.03em' : '0em';

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">`,
    `  <text`,
    `    x="60"`,
    `    y="60"`,
    `     dy="0.35em"`,
    `    text-anchor="middle"`,
    `    fill="${escapeXml(options.color)}"`,
    `    font-family='${fontEntry.family}'`,
    `    font-size="${fontSize}"`,
    `    font-weight="${options.fontWeight}"`,
    `    font-style="${fontStyle}"`,
    `    letter-spacing="${letterSpacing}"`,
    `  >${escapeXml(cleanText)}</text>`,
    `</svg>`,
  ].join('\n');
}

export function buildMonogramAsset(options: MonogramOptions): UploadedAsset {
  const rawSvg = buildMonogramSvg(options);
  const safeSlug =
    (options.text || 'F')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'monogram';
  return svgStringToUploadedAsset(rawSvg, `monogram-${safeSlug}.svg`, 120);
}

export interface GlyphDefinition {
  id: string;
  label: string;
  /** Inner SVG elements inside a 24x24 Feather/Lucide coordinate space */
  inner24: string;
}

export const CURATED_ICON_GLYPHS: GlyphDefinition[] = [
  {
    id: 'sparkles',
    label: 'Sparkles',
    inner24:
      `<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>`,
  },
  {
    id: 'zap',
    label: 'Zap',
    inner24: `<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>`,
  },
  {
    id: 'rocket',
    label: 'Rocket',
    inner24:
      `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>`,
  },
  {
    id: 'code',
    label: 'Code',
    inner24: `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
  },
  {
    id: 'terminal',
    label: 'Terminal',
    inner24: `<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>`,
  },
  {
    id: 'globe',
    label: 'Globe',
    inner24:
      `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>`,
  },
  {
    id: 'layers',
    label: 'Layers',
    inner24:
      `<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>`,
  },
  {
    id: 'cpu',
    label: 'CPU',
    inner24:
      `<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>`,
  },
  {
    id: 'shield',
    label: 'Shield',
    inner24:
      `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`,
  },
  {
    id: 'star',
    label: 'Star',
    inner24:
      `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  },
  {
    id: 'heart',
    label: 'Heart',
    inner24:
      `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`,
  },
  {
    id: 'flame',
    label: 'Flame',
    inner24:
      `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>`,
  },
  {
    id: 'compass',
    label: 'Compass',
    inner24:
      `<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>`,
  },
  {
    id: 'box',
    label: 'Cube',
    inner24:
      `<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>`,
  },
  {
    id: 'cloud',
    label: 'Cloud',
    inner24: `<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>`,
  },
  {
    id: 'lock',
    label: 'Lock',
    inner24:
      `<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
  },
  {
    id: 'send',
    label: 'Send',
    inner24:
      `<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>`,
  },
  {
    id: 'feather',
    label: 'Feather',
    inner24:
      `<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>`,
  },
];

export interface GlyphOptions {
  glyphId: string;
  color: string;
  strokeWidth: number;
}

export function buildGlyphSvg(options: GlyphOptions): string {
  const glyph =
    CURATED_ICON_GLYPHS.find((g) => g.id === options.glyphId) ?? CURATED_ICON_GLYPHS[0];
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="120" height="120" fill="none" stroke="${escapeXml(options.color)}" stroke-width="${options.strokeWidth}" stroke-linecap="round" stroke-linejoin="round">`,
    `  <g transform="translate(3 3) scale(0.75)">`,
    `    ${glyph.inner24}`,
    `  </g>`,
    `</svg>`,
  ].join('\n');
}

export function buildGlyphAsset(options: GlyphOptions): UploadedAsset {
  const rawSvg = buildGlyphSvg(options);
  return svgStringToUploadedAsset(rawSvg, `icon-${options.glyphId}.svg`, 120);
}
