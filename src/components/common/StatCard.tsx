import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  trend?: string;
  trendPositive?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
  trendPositive = true,
  className = '',
}) => {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-50/70',
      iconBg: 'bg-[#164A9B] text-white',
      border: 'border-blue-100',
      text: 'text-[#164A9B]',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      iconBg: 'bg-[#159B73] text-white',
      border: 'border-emerald-100',
      text: 'text-[#159B73]',
    },
    amber: {
      bg: 'bg-amber-50/70',
      iconBg: 'bg-[#E99A24] text-white',
      border: 'border-amber-100',
      text: 'text-[#E99A24]',
    },
    rose: {
      bg: 'bg-rose-50/70',
      iconBg: 'bg-[#D94343] text-white',
      border: 'border-rose-100',
      text: 'text-[#D94343]',
    },
    purple: {
      bg: 'bg-purple-50/70',
      iconBg: 'bg-purple-600 text-white',
      border: 'border-purple-100',
      text: 'text-purple-600',
    },
    slate: {
      bg: 'bg-slate-50',
      iconBg: 'bg-slate-700 text-white',
      border: 'border-slate-200',
      text: 'text-slate-800',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`relative bg-white rounded-2xl p-5 border ${style.border} shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl shadow-sm ${style.iconBg} flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
          {trend && (
            <span
              className={`font-bold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

