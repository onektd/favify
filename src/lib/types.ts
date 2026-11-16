export type ShapePreset = 'squircle' | 'rounded' | 'circle' | 'square';
export type BgType = 'solid' | 'gradient' | 'transparent';
export type BorderType = 'solid' | 'none';
export type ArtworkTintMode = 'original' | 'solid';
export type ShadowMode = 'none' | 'soft';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface UploadedAsset {
  kind: 'svg' | 'raster';
  dataUrl: string;
  rawSvg?: string;
  width: number;
  height: number;
  fileName: string;
}

export interface IconConfig {
  offsetX: number; // percentage of canvas (-100 to 100)
  offsetY: number; // percentage of canvas (-100 to 100)
  scale: number; // 0.2 to 3.0
  rotation: number; // -180 to 180 deg
  flipX: boolean;
  flipY: boolean;
  shapePreset: ShapePreset;
  cornerRadius: number; // 0 to 50 (% of size)
  bgType: BgType;
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number; // 0 to 360 deg
  borderType: BorderType;
  borderWidth: number; // 0 to 16 (% of size)
  borderColor: string;
  borderOpacity: number; // 0 to 1
  tintMode: ArtworkTintMode;
  tintColor: string;
  shadowMode: ShadowMode;
  shadowOpacity: number; // 0.05 to 0.85
  shadowBlur: number; // 0 to 24 (% of size)
  shadowOffsetY: number; // 0 to 16 (% of size)
  shadowColor: string;
}

export interface ManifestConfig {
  name: string;
  shortName: string;
  description: string;
  startUrl: string;
  display: 'standalone' | 'minimal-ui' | 'fullscreen' | 'browser';
  themeColor: string;
  backgroundColor: string;
}

export const DEFAULT_SVG_MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <path d="M38 30H82C85.3 30 88 32.7 88 36V40C88 43.3 85.3 46 82 46H54V56H74C77.3 56 80 58.7 80 62V64C80 67.3 77.3 70 74 70H54V86C54 89.3 51.3 92 48 92H44C40.7 92 38 89.3 38 86V30Z" fill="#ffffff"/>
  <path d="M84 68L87.5 76.5L96 80L87.5 83.5L84 92L80.5 83.5L72 80L80.5 76.5L84 68Z" fill="#c7d2fe"/>
</svg>`;

export interface FavifyProjectFile {
  version: 1;
  sourceFileName: string;
  sourceKind: 'svg' | 'raster';
  sourceWidth: number;
  sourceHeight: number;
  iconConfig: IconConfig;
  manifestConfig: ManifestConfig;
}

export function getDefaultAsset(): UploadedAsset {
  const encoded = typeof btoa !== 'undefined'
    ? btoa(unescape(encodeURIComponent(DEFAULT_SVG_MARK)))
    : Buffer.from(DEFAULT_SVG_MARK, 'utf-8').toString('base64');
  return {
    kind: 'svg',
    dataUrl: `data:image/svg+xml;base64,${encoded}`,
    rawSvg: DEFAULT_SVG_MARK,
    width: 120,
    height: 120,
    fileName: 'favify-mark.svg',
  };
}

export const DEFAULT_ICON_CONFIG: IconConfig = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  rotation: 0,
  flipX: false,
  flipY: false,
  shapePreset: 'squircle',
  cornerRadius: 24,
  bgType: 'gradient',
  bgColor: '#4f46e5',
  gradientStart: '#6366f1',
  gradientEnd: '#4338ca',
  gradientAngle: 135,
  borderType: 'solid',
  borderWidth: 2.5,
  borderColor: '#ffffff',
  borderOpacity: 0.25,
  tintMode: 'original',
  tintColor: '#ffffff',
  shadowMode: 'none',
  shadowOpacity: 0.35,
  shadowBlur: 8,
  shadowOffsetY: 3,
  shadowColor: '#000000',
};

export const DEFAULT_MANIFEST_CONFIG: ManifestConfig = {
  name: 'Favify App',
  shortName: 'Favify',
  description: 'Generated with Favify Icon & Manifest Studio',
  startUrl: '/',
  display: 'standalone',
  themeColor: '#4f46e5',
  backgroundColor: '#ffffff',
};
