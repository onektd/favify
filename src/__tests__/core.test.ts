import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import { encodeIco } from '../lib/icoEncoder';
import {
  buildAllInstructionsMarkdown,
  buildFrameworkGuide,
  buildHtmlHeadSnippet,
  buildIosContentsJson,
  buildNextJsMetadataSnippet,
  buildWebManifest,
  FRAMEWORK_OPTIONS,
} from '../lib/manifestBuilder';
import {
  applySvgTint,
  buildShapePathD,
  extractSvgParts,
  renderIconToSvgString,
} from '../lib/iconRenderer';
import { buildGlyphSvg, buildMonogramSvg } from '../lib/markGenerator';
import { importProjectFromZip } from '../lib/zipExporter';
import { DEFAULT_ICON_CONFIG, DEFAULT_MANIFEST_CONFIG, getDefaultAsset } from '../lib/types';

describe('icoEncoder', () => {
  it('creates a valid multi-size ICO binary header and directory', () => {
    const fakePng16 = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]);
    const fakePng32 = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 5, 6, 7, 8, 9]);
    const fakePng48 = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 10, 11]);

    const ico = encodeIco([
      { size: 16, data: fakePng16 },
      { size: 32, data: fakePng32 },
      { size: 48, data: fakePng48 },
    ]);

    const view = new DataView(ico.buffer);
    expect(view.getUint16(0, true)).toBe(0); // reserved
    expect(view.getUint16(2, true)).toBe(1); // type = ICO
    expect(view.getUint16(4, true)).toBe(3); // 3 images

    // Check first directory entry (16x16)
    expect(view.getUint8(6)).toBe(16);
    expect(view.getUint8(7)).toBe(16);
    expect(view.getUint32(6 + 8, true)).toBe(fakePng16.byteLength);
    expect(view.getUint32(6 + 12, true)).toBe(6 + 16 * 3);
  });

  it('throws when given no entries', () => {
    expect(() => encodeIco([])).toThrow();
  });
});

describe('manifestBuilder', () => {
  it('builds valid site.webmanifest JSON with /assets/ icon paths', () => {
    const json = buildWebManifest(DEFAULT_MANIFEST_CONFIG);
    const parsed = JSON.parse(json);
    expect(parsed.name).toBe('Favify App');
    expect(parsed.short_name).toBe('Favify');
    expect(parsed.icons).toHaveLength(4);
    expect(parsed.icons[0].src).toBe('/assets/icon-192x192.png');
    expect(parsed.icons[2].purpose).toBe('maskable');
  });

  it('builds HTML head snippet with /assets/ paths', () => {
    const html = buildHtmlHeadSnippet(DEFAULT_MANIFEST_CONFIG);
    expect(html).toContain('rel="icon" href="/assets/favicon.ico"');
    expect(html).toContain('rel="icon" href="/assets/favicon.svg"');
    expect(html).toContain('href="/assets/apple-touch-icon.png"');
    expect(html).toContain('rel="manifest" href="/assets/site.webmanifest"');
    expect(html).toContain(DEFAULT_MANIFEST_CONFIG.themeColor);
  });

  it('builds Next.js Metadata snippet with /assets/ paths', () => {
    const code = buildNextJsMetadataSnippet(DEFAULT_MANIFEST_CONFIG);
    expect(code).toContain("import type { Metadata, Viewport } from 'next';");
    expect(code).toContain("manifest: '/assets/site.webmanifest'");
    expect(code).toContain("url: '/assets/favicon.ico'");
    expect(code).toContain("url: '/assets/apple-touch-icon.png'");
    expect(code).toContain(`themeColor: '${DEFAULT_MANIFEST_CONFIG.themeColor}'`);
  });

  it('builds Xcode Contents.json with 12 iOS icon entries', () => {
    const parsed = JSON.parse(buildIosContentsJson());
    expect(parsed.images).toHaveLength(12);
    expect(parsed.info.author).toBe('favify');
  });

  it('generates installation steps and code snippets for all 9 frameworks', () => {
    expect(FRAMEWORK_OPTIONS).toHaveLength(9);
    for (const opt of FRAMEWORK_OPTIONS) {
      const guide = buildFrameworkGuide(opt.id, DEFAULT_MANIFEST_CONFIG);
      expect(guide.steps.length).toBeGreaterThanOrEqual(2);
      expect(guide.code.length).toBeGreaterThan(20);
      expect(guide.filename).toBe(opt.filename);
    }
    const md = buildAllInstructionsMarkdown(DEFAULT_MANIFEST_CONFIG);
    expect(md).toContain('Ruby on Rails');
    expect(md).toContain('ASP.NET Core');
    expect(md).toContain('Gulp');
    expect(md).toContain('Grunt');
  });
});

describe('iconRenderer SVG generation', () => {
  it('extracts viewBox and inner content from an uploaded SVG', () => {
    const raw = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
    const parts = extractSvgParts(raw, 24, 24);
    expect(parts.viewBox).toBe('0 0 24 24');
    expect(parts.innerContent).toBe('<circle cx="12" cy="12" r="10"/>');
  });

  it('renders pure vector SVG for SVG assets with gradient and border', () => {
    const asset = getDefaultAsset();
    const svg = renderIconToSvgString(asset, DEFAULT_ICON_CONFIG, 512);
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"');
    expect(svg).toContain('<linearGradient id="favify-bg-grad"');
    expect(svg).toContain('clip-path="url(#favify-clip)"');
    expect(svg).toContain('stroke="#ffffff"');
  });

  it('renders SVG wrapper with embedded image for raster assets', () => {
    const rasterAsset = {
      kind: 'raster' as const,
      dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
      width: 256,
      height: 256,
      fileName: 'logo.png',
    };
    const svg = renderIconToSvgString(rasterAsset, { ...DEFAULT_ICON_CONFIG, bgType: 'solid' }, 512);
    expect(svg).toContain('<image href="data:image/png;base64,iVBORw0KGgo="');
    expect(svg).toContain(`fill="${DEFAULT_ICON_CONFIG.bgColor}"`);
  });

  it('generates circle path when shapePreset is circle', () => {
    const path = buildShapePathD(100, { ...DEFAULT_ICON_CONFIG, shapePreset: 'circle' });
    expect(path).toContain('A 50 50');
  });

  it('uses fixed squircle radius regardless of cornerRadius setting', () => {
    const a = buildShapePathD(100, { ...DEFAULT_ICON_CONFIG, shapePreset: 'squircle', cornerRadius: 5 });
    const b = buildShapePathD(100, { ...DEFAULT_ICON_CONFIG, shapePreset: 'squircle', cornerRadius: 40 });
    expect(a).toBe(b);
  });
  it('preserves implicit black fill when uploaded SVG has no fill attribute', () => {
    const blackSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 2h20v20H2z"/></svg>';
    const svg = renderIconToSvgString(
      {
        kind: 'svg',
        dataUrl: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
        rawSvg: blackSvg,
        width: 24,
        height: 24,
        fileName: 'black.svg',
      },
      DEFAULT_ICON_CONFIG,
      512,
    );
    expect(svg).not.toContain('viewBox="0 0 512 512" fill="none"');
    expect(svg).toContain('fill="black"');
  });

  it('applies solid SVG tint and drop shadow filter when enabled', () => {
    const asset = getDefaultAsset();
    const svg = renderIconToSvgString(
      asset,
      {
        ...DEFAULT_ICON_CONFIG,
        tintMode: 'solid',
        tintColor: '#fde047',
        shadowMode: 'soft',
        shadowBlur: 10,
        shadowOpacity: 0.5,
      },
      512,
    );
    expect(svg).toContain('fill="#fde047"');
    expect(svg).toContain('<filter id="favify-shadow"');
    expect(svg).toContain('filter="url(#favify-shadow)"');
  });

  it('applySvgTint preserves fill="none" while recoloring visible fills and strokes', () => {
    const raw = '<svg viewBox="0 0 24 24" fill="none" stroke="#000000"><path d="M1 1h22v22H1z" fill="#123456"/></svg>';
    const tinted = applySvgTint(raw, '#ff0055');
    expect(tinted).toContain('fill="none"');
    expect(tinted).toContain('stroke="#ff0055"');
    expect(tinted).toContain('fill="#ff0055"');
  });
});

describe('markGenerator', () => {
  it('builds valid monogram and curated glyph SVGs', () => {
    const mono = buildMonogramSvg({
      text: 'FV',
      fontId: 'sans',
      fontWeight: '700',
      color: '#ffffff',
    });
    expect(mono).toContain('>FV</text>');
    expect(mono).toContain('fill="#ffffff"');

    const glyph = buildGlyphSvg({
      glyphId: 'rocket',
      color: '#38bdf8',
      strokeWidth: 2.25,
    });
    expect(glyph).toContain('stroke="#38bdf8"');
    expect(glyph).toContain('stroke-width="2.25"');
  });
});

describe('zipExporter project import', () => {
  it('restores SVG asset, iconConfig, and manifestConfig from a Favify ZIP', async () => {
    const zip = new JSZip();
    const asset = getDefaultAsset();
    zip.file(
      'favify.json',
      JSON.stringify({
        version: 1,
        sourceFileName: 'favify-mark.svg',
        sourceKind: 'svg',
        sourceWidth: 120,
        sourceHeight: 120,
        iconConfig: { ...DEFAULT_ICON_CONFIG, scale: 1.25 },
        manifestConfig: { ...DEFAULT_MANIFEST_CONFIG, name: 'Restored App' },
      }),
    );
    zip.folder('source')!.file('favify-mark.svg', asset.rawSvg!);

    const buffer = await zip.generateAsync({ type: 'uint8array' });
    const restored = await importProjectFromZip(buffer);

    expect(restored.asset.kind).toBe('svg');
    expect(restored.asset.fileName).toBe('favify-mark.svg');
    expect(restored.iconConfig.scale).toBe(1.25);
    expect(restored.manifestConfig.name).toBe('Restored App');
  });
});
