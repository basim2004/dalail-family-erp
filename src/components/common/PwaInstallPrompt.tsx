'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, X, Smartphone, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPromptBanner, setShowPromptBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (no Chrome browser address bar)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
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
      // Auto-show banner after a brief 2-second delay if not dismissed before
      const dismissed = sessionStorage.getItem('dalail_pwa_dismissed');
      if (!dismissed) {
        setShowPromptBanner(true);
      }
    };

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setInstalledSuccess(true);
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
            setInstalledSuccess(true);
          }
          setDeferredPrompt(null);
        });
      } else {
        // If browser prompt is not supported yet or already installed
        alert(
          'To install DALAIL FAMILY ERP:\n\n• On Chrome / Android: Tap the 3 dots (⋮) menu and select "Install app" or "Add to Home screen".\n• On iPhone (Safari): Tap the Share button (⎋) and select "Add to Home Screen".'
        );
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
      alert(
        'To install DALAIL FAMILY ERP:\n\n• On Chrome / Android: Tap the 3 dots (⋮) menu and select "Install app" or "Add to Home screen".\n• On iPhone (Safari): Tap the Share button (⎋) and select "Add to Home Screen".'
      );
      return;
    }

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setShowPromptBanner(false);
      setInstalledSuccess(true);
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

      {/* Success Notification after App Installation */}
      {installedSuccess && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <div className="text-xs">
            <strong className="block">App Installed Successfully!</strong>
            <span>DALAIL FAMILY ERP is now installed on your device as a standalone app.</span>
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
