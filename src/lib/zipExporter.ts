import JSZip from 'jszip';
import {
  DEFAULT_ICON_CONFIG,
  DEFAULT_MANIFEST_CONFIG,
  type FavifyProjectFile,
  type IconConfig,
  type ManifestConfig,
  type UploadedAsset,
} from './types';
import { renderIconToPngBlob, renderIconToPngBytes, renderIconToSvgString } from './iconRenderer';
import { encodeIco } from './icoEncoder';
import {
  ANDROID_MIPMAP_SPECS,
  buildAllInstructionsMarkdown,
  buildFrameworkGuide,
  buildHtmlHeadSnippet,
  buildIosContentsJson,
  buildNextJsMetadataSnippet,
  buildWebManifest,
  FRAMEWORK_OPTIONS,
  IOS_APPICON_SPECS,
} from './manifestBuilder';

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const commaIdx = dataUrl.indexOf(',');
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  if (typeof btoa === 'function') {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  return Buffer.from(bytes).toString('base64');
}

function guessMimeFromFilename(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/png';
}

export async function exportCompleteZip(
  asset: UploadedAsset,
  iconConfig: IconConfig,
  manifestConfig: ManifestConfig,
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Drop-in /assets/ folder for Web, Next.js public/assets/, and PWA
  const assets = zip.folder('assets')!;
  const [png16, png32, png48, apple180, pwa192, pwa512, mask192, mask512] = await Promise.all([
    renderIconToPngBytes(asset, iconConfig, 16),
    renderIconToPngBytes(asset, iconConfig, 32),
    renderIconToPngBytes(asset, iconConfig, 48),
    renderIconToPngBlob(asset, iconConfig, 180),
    renderIconToPngBlob(asset, iconConfig, 192),
    renderIconToPngBlob(asset, iconConfig, 512),
    renderIconToPngBlob(asset, iconConfig, 192, { overrideShape: 'square' }),
    renderIconToPngBlob(asset, iconConfig, 512, { overrideShape: 'square' }),
  ]);
  const icoBytes = encodeIco([
    { size: 16, data: png16 },
    { size: 32, data: png32 },
    { size: 48, data: png48 },
  ]);

  assets.file('favicon.ico', icoBytes);
  assets.file('favicon.svg', renderIconToSvgString(asset, iconConfig, 512));
  assets.file('favicon-16x16.png', png16);
  assets.file('favicon-32x32.png', png32);
  assets.file('favicon-48x48.png', png48);
  assets.file('apple-touch-icon.png', apple180);
  assets.file('icon-192x192.png', pwa192);
  assets.file('icon-512x512.png', pwa512);
  assets.file('icon-maskable-192x192.png', mask192);
  assets.file('icon-maskable-512x512.png', mask512);
  assets.file('site.webmanifest', buildWebManifest(manifestConfig));

  // 2. iOS Xcode AppIcon.appiconset
  const ios = zip.folder('ios')!;
  const appIconSet = ios.folder('AppIcon.appiconset')!;
  appIconSet.file('Contents.json', buildIosContentsJson());

  const iosSizes = await Promise.all(
    IOS_APPICON_SPECS.map(async (spec) => ({
      filename: spec.filename,
      blob: await renderIconToPngBlob(asset, iconConfig, spec.size, { overrideShape: 'square' }),
    })),
  );
  for (const item of iosSizes) {
    appIconSet.file(item.filename, item.blob);
  }

  // 3. Android (Play Store + mipmap folders)
  const android = zip.folder('android')!;
  android.file('playstore-icon.png', await renderIconToPngBlob(asset, iconConfig, 512));
  const androidMipmaps = await Promise.all(
    ANDROID_MIPMAP_SPECS.map(async (spec) => ({
      folder: spec.folder,
      filename: spec.filename,
      blob: await renderIconToPngBlob(asset, iconConfig, spec.size),
    })),
  );
  for (const item of androidMipmaps) {
    android.folder(item.folder)!.file(item.filename, item.blob);
  }

  // 4. Ready-to-paste header snippets & multi-framework instructions
  zip.file('INSTRUCTIONS.md', buildAllInstructionsMarkdown(manifestConfig));
  zip.file('head-snippet.html', buildHtmlHeadSnippet(manifestConfig));
  zip.file('nextjs-metadata.ts', buildNextJsMetadataSnippet(manifestConfig));

  const snippetsFolder = zip.folder('snippets')!;
  for (const opt of FRAMEWORK_OPTIONS) {
    const guide = buildFrameworkGuide(opt.id, manifestConfig);
    snippetsFolder.file(guide.filename, guide.code);
  }

  // 6. Favify project settings & original source artwork for round-trip re-editing
  const safeName = asset.fileName.replace(/[\\/]/g, '_') || 'artwork';
  const project: FavifyProjectFile = {
    version: 1,
    sourceFileName: safeName,
    sourceKind: asset.kind,
    sourceWidth: asset.width,
    sourceHeight: asset.height,
    iconConfig,
    manifestConfig,
  };
  zip.file('favify.json', JSON.stringify(project, null, 2));

  const sourceFolder = zip.folder('source')!;
  if (asset.kind === 'svg' && asset.rawSvg) {
    sourceFolder.file(safeName, asset.rawSvg);
  } else {
    sourceFolder.file(safeName, dataUrlToUint8Array(asset.dataUrl));
  }

  return zip.generateAsync({ type: 'blob' });
}

export async function importProjectFromZip(
  input: File | Blob | ArrayBuffer | Uint8Array,
): Promise<{
  asset: UploadedAsset;
  iconConfig: IconConfig;
  manifestConfig: ManifestConfig;
}> {
  const zip = await JSZip.loadAsync(input);
  const projectEntry = zip.file('favify.json');
  if (!projectEntry) {
    throw new Error('This ZIP does not contain a favify.json settings file.');
  }

  const projectText = await projectEntry.async('string');
  const project = JSON.parse(projectText) as FavifyProjectFile;

  const sourceEntry = zip.file(`source/${project.sourceFileName}`);
  if (!sourceEntry) {
    throw new Error(`Original artwork "source/${project.sourceFileName}" is missing from the ZIP.`);
  }

  let asset: UploadedAsset;
  if (project.sourceKind === 'svg') {
    const rawSvg = await sourceEntry.async('string');
    const bytes = new TextEncoder().encode(rawSvg);
    const b64 = uint8ArrayToBase64(bytes);
    asset = {
      kind: 'svg',
      dataUrl: `data:image/svg+xml;base64,${b64}`,
      rawSvg,
      width: project.sourceWidth || 120,
      height: project.sourceHeight || 120,
      fileName: project.sourceFileName,
    };
  } else {
    const bytes = await sourceEntry.async('uint8array');
    const mime = guessMimeFromFilename(project.sourceFileName);
    const b64 = uint8ArrayToBase64(bytes);
    asset = {
      kind: 'raster',
      dataUrl: `data:${mime};base64,${b64}`,
      width: project.sourceWidth || 512,
      height: project.sourceHeight || 512,
      fileName: project.sourceFileName,
    };
  }

  const normalizedIconConfig: IconConfig = {
    ...DEFAULT_ICON_CONFIG,
    ...project.iconConfig,
    flipX: project.iconConfig.flipX ?? false,
    flipY: project.iconConfig.flipY ?? false,
    borderType:
      project.iconConfig.borderType ??
      (project.iconConfig.borderWidth > 0 ? 'solid' : 'none'),
  };

  return {
    asset,
    iconConfig: normalizedIconConfig,
    manifestConfig: {
      ...DEFAULT_MANIFEST_CONFIG,
      ...project.manifestConfig,
    },
  };
}
