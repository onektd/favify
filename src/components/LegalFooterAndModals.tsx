'use client';

import { useEffect, useState } from 'react';
import { Cookie, ExternalLink, Monitor, Moon, Scale, Sun, X } from 'lucide-react';
import type { ThemeMode } from '@/lib/types';
import { Button, Card, SegmentedControl } from './ui/primitives';

type LegalTab = 'privacy' | 'terms' | 'cookies';

const CONSENT_STORAGE_KEY = 'favify.consent.v1';

interface LegalFooterAndModalsProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export function LegalFooterAndModals({
  theme,
  onThemeChange,
}: LegalFooterAndModalsProps) {
  const [modalTab, setModalTab] = useState<LegalTab | null>(null);
  const [showConsentBanner, setShowConsentBanner] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!saved) {
      setShowConsentBanner(true);
    }
  }, []);

  useEffect(() => {
    if (!modalTab) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalTab(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalTab]);

  const handleAcceptConsent = () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
    setShowConsentBanner(false);
  };

  return (
    <>
      {/* Sleek Studio Footer */}
      <footer className="mt-auto shrink-0 border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 sm:px-6 text-[12px] text-muted">
          <div className="flex items-center gap-2">
            <span>
              Built by{' '}
              <a
                href="https://ktd.one"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-fg hover:text-primary transition-colors underline decoration-border-strong underline-offset-2"
              >
                ktd.one
              </a>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com/onektd/favify"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-fg transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-border-strong">·</span>
            <button
              type="button"
              onClick={() => setModalTab('privacy')}
              className="hover:text-fg transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-border-strong">·</span>
            <button
              type="button"
              onClick={() => setModalTab('terms')}
              className="hover:text-fg transition-colors cursor-pointer"
            >
              Terms &amp; License
            </button>
            <span className="text-border-strong">·</span>
            <button
              type="button"
              onClick={() => setModalTab('cookies')}
              className="hover:text-fg transition-colors cursor-pointer"
            >
              Cookies
            </button>

            <div className="hidden sm:block h-4 w-px bg-border mx-0.5" />

            <SegmentedControl<ThemeMode>
              value={theme}
              onChange={onThemeChange}
              options={[
                {
                  value: 'light',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5" />
                      Light
                    </span>
                  ),
                },
                {
                  value: 'dark',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <Moon className="h-3.5 w-3.5" />
                      Dark
                    </span>
                  ),
                },
                {
                  value: 'system',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <Monitor className="h-3.5 w-3.5" />
                      System
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </footer>

      {/* First-Visit Cookie / Local Storage & Upload Privacy Banner */}
      {showConsentBanner && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-40 max-w-md">
          <Card className="p-4 shadow-pop border-border-strong bg-surface">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Cookie className="h-4 w-4" />
              </div>
              <div className="space-y-2 min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-fg">
                  Privacy, Uploads &amp; Local Storage
                </div>
                <p className="text-[12px] leading-relaxed text-muted">
                  All images you upload are processed <strong>100% locally in your browser</strong> and are never sent to any server. We only use essential browser storage to save your theme and consent preferences.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setModalTab('privacy')}
                  >
                    Privacy &amp; Terms
                  </Button>
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={handleAcceptConsent}
                  >
                    Accept &amp; Continue
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Legal & Privacy Modal */}
      {modalTab && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-scrim p-4 backdrop-blur-[2px]"
          onClick={() => setModalTab(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Legal and Privacy Information"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-pop overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                <h2 className="text-[14px] font-semibold text-fg">
                  Favify Legal, Privacy &amp; License
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setModalTab(null)}
                className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-fg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-border bg-surface-2/40 px-4 py-3">
              <SegmentedControl<LegalTab>
                fullWidth
                value={modalTab}
                onChange={setModalTab}
                options={[
                  { value: 'privacy', label: 'Privacy Policy' },
                  { value: 'terms', label: 'Terms & License' },
                  { value: 'cookies', label: 'Cookies & Storage' },
                ]}
              />
            </div>

            <div className="max-h-[65vh] overflow-y-auto scroll-thin p-4 space-y-3 text-[12.5px] leading-relaxed text-muted">
              {modalTab === 'privacy' && (
                <>
                  <h3 className="text-[13px] font-semibold text-fg">
                    1. 100% Client-Side Image Processing
                  </h3>
                  <p>
                    Favify operates entirely inside your web browser. When you select or drag-and-drop an <code className="font-mono text-fg">SVG</code>, <code className="font-mono text-fg">PNG</code>, <code className="font-mono text-fg">JPG</code>, <code className="font-mono text-fg">WebP</code>, or <code className="font-mono text-fg">.zip</code> file, it is read and rendered locally in your device&apos;s memory using HTML5 Canvas and Web APIs.
                  </p>
                  <h3 className="text-[13px] font-semibold text-fg">
                    2. Zero Server Uploads or Retention
                  </h3>
                  <p>
                    Your artwork, logos, and generated icon bundles are <strong>never uploaded, transmitted, logged, or stored</strong> on any external server. Closing or refreshing the browser tab immediately clears your uploaded session from memory.
                  </p>
                  <h3 className="text-[13px] font-semibold text-fg">
                    3. Open-Source Transparency
                  </h3>
                  <p>
                    You can inspect the complete source code at{' '}
                    <a
                      href="https://github.com/onektd/favify"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      github.com/onektd/favify
                    </a>
                    .
                  </p>
                </>
              )}

              {modalTab === 'terms' && (
                <>
                  <h3 className="text-[13px] font-semibold text-fg">
                    1. Ownership of Generated Assets
                  </h3>
                  <p>
                    You retain 100% ownership and rights to the icons, favicons, mobile assets, and web manifests you generate using Favify. You may use your exported assets freely in any personal or commercial project. You are responsible for ensuring you have the right to use any source artwork you upload.
                  </p>
                  <h3 className="text-[13px] font-semibold text-fg">
                    2. Open-Source License &amp; Commercial Restriction
                  </h3>
                  <p>
                    Favify is created by{' '}
                    <a
                      href="https://ktd.one"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      ktd.one
                    </a>{' '}
                    and released under the <strong>MIT + Commons Clause License</strong>. It is free to use, fork, modify, and self-host, provided that visible attribution to <strong>ktd.one</strong> and{' '}
                    <a
                      href="https://github.com/onektd/favify"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      github.com/onektd/favify
                    </a>{' '}
                    is preserved. Forking, renaming, or packaging Favify to sell or offer as a paid/commercial tool is strictly prohibited.
                  </p>
                  <h3 className="text-[13px] font-semibold text-fg">
                    3. No Warranty
                  </h3>
                  <p>
                    Favify is provided &quot;as is&quot; without warranties of any kind.
                  </p>
                </>
              )}

              {modalTab === 'cookies' && (
                <>
                  <h3 className="text-[13px] font-semibold text-fg">
                    1. No Tracking or Advertising Cookies
                  </h3>
                  <p>
                    Favify does not use analytics trackers, advertising cookies, or third-party profiling scripts.
                  </p>
                  <h3 className="text-[13px] font-semibold text-fg">
                    2. Essential Browser Local Storage
                  </h3>
                  <p>
                    Favify stores only two local preference keys in your browser&apos;s <code className="font-mono text-fg">localStorage</code>:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <code className="font-mono text-fg">favify.theme</code> — remembers your chosen appearance mode (<code className="font-mono">light</code>, <code className="font-mono">dark</code>, or <code className="font-mono">system</code>).
                    </li>
                    <li>
                      <code className="font-mono text-fg">favify.consent.v1</code> — remembers that you dismissed the privacy &amp; storage notice.
                    </li>
                  </ul>
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border bg-surface-2/40 px-4 py-3">
              <span className="text-[11.5px] text-muted">
                © {new Date().getFullYear()}{' '}
                <a
                  href="https://ktd.one"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-fg hover:text-primary"
                >
                  ktd.one
                </a>
              </span>
              <Button
                size="xs"
                variant="primary"
                onClick={() => {
                  handleAcceptConsent();
                  setModalTab(null);
                }}
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
