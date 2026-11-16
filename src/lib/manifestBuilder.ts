import type { ManifestConfig } from './types';

export type FrameworkId =
  | 'html'
  | 'react'
  | 'nextjs'
  | 'rails'
  | 'node'
  | 'node-cli'
  | 'gulp'
  | 'grunt'
  | 'aspnet';

export interface FrameworkOption {
  id: FrameworkId;
  label: string;
  filename: string;
  mime: string;
}

export const FRAMEWORK_OPTIONS: FrameworkOption[] = [
  { id: 'html', label: 'HTML', filename: 'head-snippet.html', mime: 'text/html' },
  { id: 'react', label: 'React', filename: 'FavifyHead.tsx', mime: 'text/typescript' },
  { id: 'nextjs', label: 'Next.js', filename: 'nextjs-metadata.ts', mime: 'text/typescript' },
  { id: 'rails', label: 'Ruby on Rails', filename: '_favify_head.html.erb', mime: 'text/plain' },
  { id: 'node', label: 'Node', filename: 'node-express.js', mime: 'text/javascript' },
  { id: 'node-cli', label: 'Node CLI', filename: 'install-favify.sh', mime: 'text/x-shellscript' },
  { id: 'gulp', label: 'Gulp', filename: 'gulpfile.favify.js', mime: 'text/javascript' },
  { id: 'grunt', label: 'Grunt', filename: 'Gruntfile.favify.js', mime: 'text/javascript' },
  { id: 'aspnet', label: 'ASP.NET Core', filename: '_FavifyHead.cshtml', mime: 'text/plain' },
];

export function buildWebManifest(config: ManifestConfig): string {
  const manifest = {
    name: config.name.trim() || 'My App',
    short_name: config.shortName.trim() || config.name.trim() || 'App',
    description: config.description.trim() || undefined,
    start_url: config.startUrl.trim() || '/',
    display: config.display,
    background_color: config.backgroundColor,
    theme_color: config.themeColor,
    icons: [
      {
        src: '/assets/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/assets/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/assets/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/assets/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return JSON.stringify(manifest, null, 2);
}

export function buildHtmlHeadSnippet(config: ManifestConfig): string {
  const appTitle = config.shortName.trim() || config.name.trim() || 'App';
  return [
    `<link rel="icon" href="/assets/favicon.ico" sizes="48x48">`,
    `<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">`,
    `<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">`,
    `<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">`,
    `<meta name="apple-mobile-web-app-title" content="${appTitle}">`,
    `<link rel="manifest" href="/assets/site.webmanifest">`,
    `<meta name="theme-color" content="${config.themeColor}">`,
  ].join('\n');
}

export function buildNextJsMetadataSnippet(config: ManifestConfig): string {
  const title = (config.name.trim() || 'My App').replace(/'/g, "\\'");
  const shortTitle = (config.shortName.trim() || title).replace(/'/g, "\\'");
  const description = (config.description.trim() || 'Web application').replace(/'/g, "\\'");
  return [
    `import type { Metadata, Viewport } from 'next';`,
    ``,
    `export const viewport: Viewport = {`,
    `  themeColor: '${config.themeColor}',`,
    `};`,
    ``,
    `export const metadata: Metadata = {`,
    `  title: '${title}',`,
    `  description: '${description}',`,
    `  manifest: '/assets/site.webmanifest',`,
    `  appleWebApp: {`,
    `    title: '${shortTitle}',`,
    `  },`,
    `  icons: {`,
    `    icon: [`,
    `      { url: '/assets/favicon.ico', sizes: '48x48' },`,
    `      { url: '/assets/favicon.svg', type: 'image/svg+xml' },`,
    `      { url: '/assets/favicon-32x32.png', sizes: '32x32', type: 'image/png' },`,
    `      { url: '/assets/favicon-16x16.png', sizes: '16x16', type: 'image/png' },`,
    `    ],`,
    `    apple: [{ url: '/assets/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],`,
    `  },`,
    `};`,
  ].join('\n');
}

export interface FrameworkGuide {
  id: FrameworkId;
  label: string;
  filename: string;
  mime: string;
  steps: string[];
  code: string;
}

export function buildFrameworkGuide(
  id: FrameworkId,
  config: ManifestConfig,
): FrameworkGuide {
  const opt = FRAMEWORK_OPTIONS.find((o) => o.id === id) ?? FRAMEWORK_OPTIONS[0];
  const appTitle = config.shortName.trim() || config.name.trim() || 'App';

  switch (id) {
    case 'html':
      return {
        ...opt,
        steps: [
          'Extract the assets/ folder into the root of your website so files are accessible at /assets/favicon.ico, /assets/favicon.svg, etc.',
          'Paste the following <link> and <meta> tags inside the <head> section of your HTML pages.',
        ],
        code: buildHtmlHeadSnippet(config),
      };

    case 'react':
      return {
        ...opt,
        steps: [
          'Copy the assets/ folder into your React project’s public/ directory (public/assets/).',
          'Render <FavifyHead /> in your root App component (React 19 automatically hoists <link> and <meta> tags to <head>), or place the tags inside index.html.',
        ],
        code: [
          `export function FavifyHead() {`,
          `  return (`,
          `    <>`,
          `      <link rel="icon" href="/assets/favicon.ico" sizes="48x48" />`,
          `      <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />`,
          `      <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />`,
          `      <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />`,
          `      <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />`,
          `      <meta name="apple-mobile-web-app-title" content="${appTitle}" />`,
          `      <link rel="manifest" href="/assets/site.webmanifest" />`,
          `      <meta name="theme-color" content="${config.themeColor}" />`,
          `    </>`,
          `  );`,
          `}`,
        ].join('\n'),
      };

    case 'nextjs':
      return {
        ...opt,
        steps: [
          'Copy the assets/ folder into your Next.js public/ directory (public/assets/).',
          'Add the following viewport and metadata exports to your root src/app/layout.tsx (or app/layout.tsx).',
        ],
        code: buildNextJsMetadataSnippet(config),
      };

    case 'rails':
      return {
        ...opt,
        steps: [
          'Place the assets/ folder inside your Rails public/ directory (public/assets/).',
          'Render these ERB helpers inside the <head> of app/views/layouts/application.html.erb.',
        ],
        code: [
          `<%= favicon_link_tag '/assets/favicon.ico', rel: 'icon', sizes: '48x48' %>`,
          `<%= favicon_link_tag '/assets/favicon.svg', rel: 'icon', type: 'image/svg+xml' %>`,
          `<%= favicon_link_tag '/assets/favicon-32x32.png', rel: 'icon', type: 'image/png', sizes: '32x32' %>`,
          `<%= favicon_link_tag '/assets/favicon-16x16.png', rel: 'icon', type: 'image/png', sizes: '16x16' %>`,
          `<%= favicon_link_tag '/assets/apple-touch-icon.png', rel: 'apple-touch-icon', type: 'image/png', sizes: '180x180' %>`,
          `<meta name="apple-mobile-web-app-title" content="${appTitle}">`,
          `<link rel="manifest" href="/assets/site.webmanifest">`,
          `<meta name="theme-color" content="${config.themeColor}">`,
        ].join('\n'),
      };

    case 'node':
      return {
        ...opt,
        steps: [
          'Copy the assets/ folder into your project’s public/assets/ directory.',
          'Serve /assets statically in Express/Fastify and include FAVIFY_HEAD_TAGS in your HTML layout or template engine.',
        ],
        code: [
          `import express from 'express';`,
          `import path from 'node:path';`,
          ``,
          `const app = express();`,
          `app.use('/assets', express.static(path.join(process.cwd(), 'public/assets')));`,
          ``,
          `export const FAVIFY_HEAD_TAGS = \``,
          buildHtmlHeadSnippet(config),
          `\`;`,
        ].join('\n'),
      };

    case 'node-cli':
      return {
        ...opt,
        steps: [
          'Save favify-icons.zip to your project root or Downloads folder.',
          'Run the following CLI commands to extract assets/ into public/assets/ and copy the snippets.',
        ],
        code: [
          `# 1. Create public/assets directory and extract icons`,
          `mkdir -p public/assets`,
          `unzip -o favify-icons.zip "assets/*" -d public/`,
          ``,
          `# 2. Verify extracted favicon and manifest files`,
          `ls -la public/assets`,
        ].join('\n'),
      };

    case 'gulp':
      return {
        ...opt,
        steps: [
          'Place the extracted assets/ folder inside src/assets/.',
          'Add this Gulp task to your gulpfile.js to copy all Favify icons and site.webmanifest into dist/assets/ during builds.',
        ],
        code: [
          `import gulp from 'gulp';`,
          ``,
          `export function copyFavifyAssets() {`,
          `  return gulp`,
          `    .src('src/assets/{favicon*,apple-touch-icon.png,icon-*.png,site.webmanifest}', { encoding: false })`,
          `    .pipe(gulp.dest('dist/assets'));`,
          `}`,
          ``,
          `export default gulp.series(copyFavifyAssets);`,
        ].join('\n'),
      };

    case 'grunt':
      return {
        ...opt,
        steps: [
          'Place the extracted assets/ folder inside src/assets/.',
          'Configure grunt-contrib-copy in your Gruntfile.js to copy the Favify assets into dist/assets/.',
        ],
        code: [
          `module.exports = function (grunt) {`,
          `  grunt.initConfig({`,
          `    copy: {`,
          `      favify: {`,
          `        expand: true,`,
          `        cwd: 'src/assets/',`,
          `        src: ['favicon*', 'apple-touch-icon.png', 'icon-*.png', 'site.webmanifest'],`,
          `        dest: 'dist/assets/',`,
          `      },`,
          `    },`,
          `  });`,
          ``,
          `  grunt.loadNpmTasks('grunt-contrib-copy');`,
          `  grunt.registerTask('icons', ['copy:favify']);`,
          `};`,
        ].join('\n'),
      };

    case 'aspnet':
      return {
        ...opt,
        steps: [
          'Copy the assets/ folder into your ASP.NET Core wwwroot/ directory (wwwroot/assets/).',
          'Include the following Razor markup inside the <head> of Pages/Shared/_Layout.cshtml or Views/Shared/_Layout.cshtml.',
        ],
        code: [
          `<link rel="icon" href="~/assets/favicon.ico" sizes="48x48" />`,
          `<link rel="icon" href="~/assets/favicon.svg" type="image/svg+xml" />`,
          `<link rel="icon" type="image/png" sizes="32x32" href="~/assets/favicon-32x32.png" />`,
          `<link rel="icon" type="image/png" sizes="16x16" href="~/assets/favicon-16x16.png" />`,
          `<link rel="apple-touch-icon" sizes="180x180" href="~/assets/apple-touch-icon.png" />`,
          `<meta name="apple-mobile-web-app-title" content="${appTitle}" />`,
          `<link rel="manifest" href="~/assets/site.webmanifest" />`,
          `<meta name="theme-color" content="${config.themeColor}" />`,
        ].join('\n'),
      };
  }
}

export function buildAllInstructionsMarkdown(config: ManifestConfig): string {
  const sections = FRAMEWORK_OPTIONS.map((opt) => {
    const guide = buildFrameworkGuide(opt.id, config);
    const stepsMd = guide.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n');
    return [
      `## ${guide.label} (\`snippets/${guide.filename}\`)`,
      ``,
      stepsMd,
      ``,
      '```',
      guide.code,
      '```',
    ].join('\n');
  });

  return [
    `# Favify — Icon & Manifest Installation Guide`,
    ``,
    `Generated with **Favify** (https://github.com/onektd/favify · Built by https://ktd.one).`,
    ``,
    `## Bundle Contents`,
    `- \`assets/\` — Drop-in web favicons (\`favicon.ico\`, \`favicon.svg\`, \`16x16\`, \`32x32\`, \`48x48\`), \`apple-touch-icon.png\`, PWA icons (\`192x192\`, \`512x512\`, maskable), and \`site.webmanifest\`.`,
    `- \`ios/AppIcon.appiconset/\` — Xcode iOS app icon catalog (\`Contents.json\` + 12 standard sizes).`,
    `- \`android/\` — Play Store \`512x512\` icon and \`mipmap-mdpi\` through \`mipmap-xxxhdpi\` launcher icons.`,
    `- \`snippets/\` — Ready-to-paste integration files for HTML, React, Next.js, Ruby on Rails, Node, Node CLI, Gulp, Grunt, and ASP.NET Core.`,
    `- \`favify.json\` & \`source/\` — Upload this \`.zip\` back into Favify anytime to tweak and re-export your icons.`,
    ``,
    `---`,
    ``,
    ...sections.flatMap((s) => [s, '', '---', '']),
  ].join('\n');
}

export const IOS_APPICON_SPECS = [
  { filename: 'icon-20x20@2x.png', size: 40, idiom: 'iphone', pt: '20x20', scale: '2x' },
  { filename: 'icon-20x20@3x.png', size: 60, idiom: 'iphone', pt: '20x20', scale: '3x' },
  { filename: 'icon-29x29@2x.png', size: 58, idiom: 'iphone', pt: '29x29', scale: '2x' },
  { filename: 'icon-29x29@3x.png', size: 87, idiom: 'iphone', pt: '29x29', scale: '3x' },
  { filename: 'icon-40x40@2x.png', size: 80, idiom: 'iphone', pt: '40x40', scale: '2x' },
  { filename: 'icon-40x40@3x.png', size: 120, idiom: 'iphone', pt: '40x40', scale: '3x' },
  { filename: 'icon-60x60@2x.png', size: 120, idiom: 'iphone', pt: '60x60', scale: '2x' },
  { filename: 'icon-60x60@3x.png', size: 180, idiom: 'iphone', pt: '60x60', scale: '3x' },
  { filename: 'icon-76x76@1x.png', size: 76, idiom: 'ipad', pt: '76x76', scale: '1x' },
  { filename: 'icon-76x76@2x.png', size: 152, idiom: 'ipad', pt: '76x76', scale: '2x' },
  { filename: 'icon-83.5x83.5@2x.png', size: 167, idiom: 'ipad', pt: '83.5x83.5', scale: '2x' },
  { filename: 'icon-1024x1024.png', size: 1024, idiom: 'ios-marketing', pt: '1024x1024', scale: '1x' },
] as const;

export function buildIosContentsJson(): string {
  const images = IOS_APPICON_SPECS.map((spec) => ({
    filename: spec.filename,
    idiom: spec.idiom,
    scale: spec.scale,
    size: spec.pt,
  }));

  return JSON.stringify(
    {
      images,
      info: {
        author: 'favify',
        version: 1,
      },
    },
    null,
    2,
  );
}

export const ANDROID_MIPMAP_SPECS = [
  { folder: 'mipmap-mdpi', filename: 'ic_launcher.png', size: 48 },
  { folder: 'mipmap-hdpi', filename: 'ic_launcher.png', size: 72 },
  { folder: 'mipmap-xhdpi', filename: 'ic_launcher.png', size: 96 },
  { folder: 'mipmap-xxhdpi', filename: 'ic_launcher.png', size: 144 },
  { folder: 'mipmap-xxxhdpi', filename: 'ic_launcher.png', size: 192 },
] as const;
