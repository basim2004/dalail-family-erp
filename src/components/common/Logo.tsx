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
    sm: { img: 'w-9 h-9', title: 'text-sm font-bold', sub: 'text-[9px]' },
    md: { img: 'w-12 h-12', title: 'text-base font-extrabold', sub: 'text-[10px]' },
    lg: { img: 'w-16 h-16', title: 'text-xl font-black', sub: 'text-xs' },
    xl: { img: 'w-20 h-20', title: 'text-2xl font-black', sub: 'text-sm' },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Uploaded Logo Image */}
      <div className="flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/official-logo.jpg"
          alt="Dalailul Khairath Official Logo"
          className={`${sizeMap[size].img} rounded-full object-contain shadow-sm border border-slate-100`}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight select-none">
          <span
            dir="rtl"
            className="font-arabic text-xs tracking-wide opacity-95 leading-none mb-0.5"
            style={{ color: variant === 'white' ? '#EAF3FF' : '#164A9B' }}
          >
            مؤسسة دلائل الخيرات الإسلامية
          </span>
          <span className={`tracking-tight ${sizeMap[size].title} ${textColor}`}>
            DALAIL FAMILY ERP
          </span>
          <span
            className={`${sizeMap[size].sub} tracking-wider uppercase font-semibold text-slate-500`}
            style={{ color: variant === 'white' ? '#CBD5E1' : '#64748B' }}
          >
            Kakkidippuram Campus
          </span>
        </div>
      )}
    </div>
  );
};
