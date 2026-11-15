import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  variant?: 'blue' | 'white';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-[#164A9B]',
  variant = 'blue',
}) => {
  const sizeMap = {
    sm: { img: 'w-8 h-8 sm:w-9 sm:h-9', title: 'text-xs sm:text-sm font-black', sub: 'text-[9px]' },
    md: { img: 'w-10 h-10 sm:w-12 sm:h-12', title: 'text-sm sm:text-base font-black', sub: 'text-[10px]' },
    lg: { img: 'w-14 h-14 sm:w-16 sm:h-16', title: 'text-lg sm:text-xl font-black', sub: 'text-xs' },
    xl: { img: 'w-16 h-16 sm:w-20 sm:h-20', title: 'text-xl sm:text-2xl font-black', sub: 'text-sm' },
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-3 min-w-0 ${className}`}>
      {/* Official Uploaded Logo Image */}
      <div className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/official-logo.jpg"
          alt="Dalailul Khairath Official Logo"
          className={`${sizeMap[size].img} rounded-full object-contain shadow-2xs border border-slate-200 bg-white`}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight select-none min-w-0 truncate">
          {size !== 'sm' ? (
            <span
              dir="rtl"
              className="font-arabic text-xs tracking-wide opacity-95 leading-none mb-0.5"
              style={{ color: variant === 'white' ? '#EAF3FF' : '#164A9B' }}
            >
              مؤسسة دلائل الخيرات الإسلامية
            </span>
          ) : (
            <span
              dir="rtl"
              className="font-arabic text-[10px] tracking-wide opacity-90 leading-none mb-0.5 hidden md:block"
              style={{ color: variant === 'white' ? '#EAF3FF' : '#164A9B' }}
            >
              مؤسسة دلائل الخيرات الإسلامية
            </span>
          )}

          <span className={`tracking-tight ${sizeMap[size].title} ${textColor} whitespace-nowrap truncate`}>
            <span className="sm:hidden">DALAIL ERP</span>
            <span className="hidden sm:inline">DALAIL FAMILY ERP</span>
          </span>

          <span
            className={`${sizeMap[size].sub} tracking-wider uppercase font-semibold truncate hidden xs:block`}
            style={{ color: variant === 'white' ? '#CBD5E1' : '#64748B' }}
          >
            Kakkidippuram Campus
          </span>
        </div>
      )}
    </div>
  );
};
