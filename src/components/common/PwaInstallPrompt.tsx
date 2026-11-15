'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, ShieldCheck, HelpCircle, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPromptBanner, setShowPromptBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (no Chrome browser address bar)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // 2. Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          // SW registered successfully
        })
        .catch((err) => {
          console.log('SW registration error:', err);
        });
    }

    // 3. Listen for PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem('dalail_pwa_dismissed');
      if (!dismissed) {
        setShowPromptBanner(true);
      }
    };

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setShowPromptBanner(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    // 5. Custom event so any "Install App" button anywhere on the page can trigger installation
    const handleTriggerInstall = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            setShowPromptBanner(false);
          }
          setDeferredPrompt(null);
        });
      } else {
        // Show detailed installation guide for Phone & Desktop
        setShowGuideModal(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('trigger-pwa-install', handleTriggerInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('trigger-pwa-install', handleTriggerInstall);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowGuideModal(true);
      return;
    }

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setShowPromptBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPromptBanner(false);
    setIsDismissed(true);
    sessionStorage.setItem('dalail_pwa_dismissed', 'true');
  };

  // If already running inside standalone app without Chrome browser view, do not display install banner
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Install Banner */}
      {showPromptBanner && !isDismissed && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-slide-up">
          <div className="bg-slate-950/95 text-white backdrop-blur-xl p-4 sm:p-4.5 rounded-3xl border border-white/15 shadow-2xl shadow-black/40 flex items-center gap-3.5 relative overflow-hidden">
            {/* Background glowing pattern */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#164A9B]/40 rounded-full blur-2xl pointer-events-none" />

            {/* App Icon */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-white/20 bg-[#0C2F66] shadow-md shrink-0 flex items-center justify-center p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/app-icon.png"
                alt="Dalail Family ERP Icon"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            {/* Information Text */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F7D9A0] bg-white/10 px-2 py-0.5 rounded-full">
                  Official App
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> Standalone
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white truncate">
                DALAIL FAMILY ERP
              </h4>
              <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 mt-0.5">
                Install as a standalone native app (opens in full-screen with no browser address bar).
              </p>

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-[#164A9B] to-[#2876C8] hover:from-[#0C2F66] hover:to-[#164A9B] text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all transform active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors"
                >
                  Later
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close install banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile & Desktop App Installation Step Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative animate-slide-up">
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 bg-[#0C2F66] shadow-sm flex items-center justify-center p-1 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/app-icon.png" alt="Icon" className="w-full h-full object-contain rounded-xl" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Install DALAIL FAMILY ERP
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Open without Chrome browser view / address bar
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="space-y-1.5">
                <span className="font-bold text-[#164A9B] flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4 text-[#164A9B]" />
                  <span>On Android Phone (Google Chrome):</span>
                </span>
                <ol className="list-decimal list-inside pl-1 space-y-1 text-slate-600 text-[11px] leading-relaxed">
                  <li>Tap the <strong>3 dots (⋮)</strong> menu in Chrome&apos;s top-right corner.</li>
                  <li>Select <strong>&quot;Install app&quot;</strong> (അല്ലെങ്കിൽ <em>&quot;Add to Home screen&quot;</em>).</li>
                  <li>Tap <strong>&quot;Install&quot;</strong>.</li>
                  <li className="text-emerald-700 font-bold">ആപ്പ് ഹോം സ്ക്രീനിൽ വരും. അവിടെ നിന്ന് തുറക്കുമ്പോൾ Chrome search bar ഇല്ലാതെ ഫുൾ സ്ക്രീനായി ഓപ്പൺ ആകും.</li>
                </ol>
              </div>

              <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4 text-slate-600" />
                  <span>On iPhone / iPad (Safari):</span>
                </span>
                <ol className="list-decimal list-inside pl-1 space-y-1 text-slate-600 text-[11px] leading-relaxed">
                  <li>Tap the <strong>Share</strong> button (box with upward arrow) at the bottom.</li>
                  <li>Scroll and tap <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                  <li>Tap <strong>&quot;Add&quot;</strong> in the top-right.</li>
                </ol>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#164A9B] hover:bg-[#0C2F66] text-white font-bold text-xs transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Global helper function to trigger the PWA install prompt from any button
export function triggerPwaInstall() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
  }
}
