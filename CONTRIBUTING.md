# Contributing to Favify

Thank you for your interest in contributing to **Favify** ([github.com/onektd/favify](https://github.com/onektd/favify)), created by **[ktd.one](https://ktd.one)**!

Favify is built to remain **open-source, 100% client-side, and free for everyone**.

---

## Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/onektd/favify.git
   cd favify
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
   > **Note (Windows)**: Stop `npm run dev` before running `npm run build` so `.next/` is not overwritten while the dev server is active.

---

## Project Architecture

- `src/app/` — Next.js App Router layout, global OpenInbox-inspired theme tokens (`globals.css`), app favicon (`icon.svg`), and main studio page (`page.tsx`).
- `src/components/` — Studio UI panels (`UploadDropzone`, `IconCanvasEditor`, `StyleControls`, `TransformControls`, `BorderControls`, `PreviewPanel`, `ManifestPanel`, `ExportPanel`, `LegalFooterAndModals`) and reusable UI primitives (`ui/primitives.tsx`).
- `src/lib/` — Pure client-side rendering and packaging modules:
  - `iconRenderer.ts` — High-DPI HTML5 Canvas PNG renderer & pure/wrapped SVG generator.
  - `icoEncoder.ts` — Pure TypeScript multi-size `.ico` binary encoder (`16×16`, `32×32`, `48×48`).
  - `manifestBuilder.ts` — Generates `site.webmanifest`, Next.js `Metadata`, HTML `<head>` tags, and Xcode `Contents.json`.
  - `zipExporter.ts` — Packages and restores `favify-icons.zip` (`favify.json` + `/assets/` + `/ios/` + `/android/`).
- `src/__tests__/` — Vitest unit test suite (`core.test.ts`).

---

## Quality Checks Before Submitting a PR

Before opening a Pull Request, please ensure all checks pass:

```bash
# 1. Run unit tests
npm test

# 2. Verify TypeScript strict types
npx tsc --noEmit

# 3. Verify static export build
npm run build
```

### Guidelines
- **Keep it 100% client-side**: Favify must build cleanly with `output: 'export'` so it runs on GitHub Pages and Vercel without server dependencies.
- **Maintain UI symmetry & consistency**: Use the existing primitives in `src/components/ui/primitives.tsx` and CSS variables in `src/app/globals.css` so both Light and Dark themes remain crisp.
- **License & Attribution**: By contributing, you agree that your contributions will be licensed under the repository's [MIT + Commons Clause License](./LICENSE) with attribution to [ktd.one](https://ktd.one).
