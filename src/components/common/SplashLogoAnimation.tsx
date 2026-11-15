'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashLogoAnimationProps {
  onFinish?: () => void;
  allowSkip?: boolean;
  forceShow?: boolean;
}

export const SplashLogoAnimation: React.FC<SplashLogoAnimationProps> = ({
  onFinish,
  allowSkip = true,
  forceShow = false,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if shown in this session if not forced
    if (typeof window !== 'undefined') {
      const alreadyShown = sessionStorage.getItem('dalail_splash_shown');
      if (forceShow || !alreadyShown) {
        setVisible(true);
        sessionStorage.setItem('dalail_splash_shown', 'true');

        const timer = setTimeout(() => {
          setVisible(false);
          if (onFinish) onFinish();
        }, 3400);

        return () => clearTimeout(timer);
      }
    }
  }, [forceShow, onFinish]);

  const handleDismiss = () => {
    if (!allowSkip) return;
    setVisible(false);
    if (onFinish) onFinish();
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#0C2F66] via-[#164A9B] to-[#2876C8] animate-splash-out select-none cursor-pointer overflow-hidden"
      role="banner"
      aria-label="Dalail Family ERP Loading Splash"
    >
      {/* Islamic geometric pattern overlay */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-30 pointer-events-none" />

      {/* Pulsing ring + Brand Logo */}
      <div className="relative w-[150px] h-[150px] flex items-center justify-center">
        {/* Pulsing gold halo ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#E99A24] animate-ring-pulse pointer-events-none" />

        {/* Logo Container with 3D drop shadow */}
        <div className="relative w-[130px] h-[130px] rounded-full overflow-hidden shadow-2xl bg-white p-2 flex items-center justify-center animate-logo-in">
          <Image
            src="/assets/official-logo.jpg"
            alt="Dalailul Khairath Logo"
            width={120}
            height={120}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>

      {/* Typography with slide-in animation */}
      <div className="relative text-center text-white px-4 animate-text-in">
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-md">
          Dalail Family ERP
        </h1>
        <p className="text-xs sm:text-[13px] tracking-[0.2em] font-semibold text-[#F7D9A0] mt-2 uppercase drop-shadow-xs">
          DALAILUL KHAIRATH ISLAMIC FOUNDATION
        </p>
      </div>

      {/* Gold progress loading bar */}
      <div className="relative w-44 h-1.5 rounded-full bg-white/20 overflow-hidden mt-1 shadow-inner">
        <div className="h-full bg-[#E99A24] rounded-full animate-bar-fill" />
      </div>

      {allowSkip && (
        <span className="absolute bottom-6 text-[11px] font-medium text-white/50 hover:text-white/80 transition-colors uppercase tracking-wider">
          Tap anywhere to continue
        </span>
      )}
    </div>
  );
};

