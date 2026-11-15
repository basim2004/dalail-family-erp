import React from 'react';

interface SealProps {
  className?: string;
  size?: number; // size in px
}

export const Seal: React.FC<SealProps> = ({
  className = '',
  size = 130,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/office-seal.png"
        alt="Dalailul Khairath Official Seal"
        className="w-full h-full object-contain filter contrast-125"
      />
    </div>
  );
};
