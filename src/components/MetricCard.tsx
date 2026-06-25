import React from 'react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  description: string;
  trend?: {
    type: 'positive' | 'negative' | 'neutral';
    text: string;
  };
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, description, trend, icon }: MetricCardProps) {
  // Let's decide a color for the indicator bar based on title or trend
  let barColor = 'bg-indigo-500';
  let barWidth = 'w-3/4'; // Default to 75% for aesthetics
  
  if (title.includes('VAN') || title.includes('Neto')) {
    barColor = trend?.type === 'negative' ? 'bg-rose-500' : 'bg-indigo-500';
    barWidth = trend?.type === 'negative' ? 'w-1/4' : 'w-4/5';
  } else if (title.includes('TIR') || title.includes('Retorno')) {
    barColor = 'bg-emerald-500';
    barWidth = 'w-2/3';
  } else if (title.includes('Inversión') || title.includes('Inicial')) {
    barColor = 'bg-amber-500';
    barWidth = 'w-1/2';
  } else if (title.includes('ROI') || title.includes('Retorno')) {
    barColor = 'bg-sky-500';
    barWidth = 'w-3/5';
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300">
      <div>
        <div className="flex justify-between items-start">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{title}</p>
          {icon && (
            <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h2>
          {trend && (
            <span className={`text-[11px] font-bold ${
              trend.type === 'positive' 
                ? 'text-emerald-600' 
                : trend.type === 'negative' 
                  ? 'text-rose-600' 
                  : 'text-slate-500'
            }`}>
              {trend.type === 'positive' ? '▲' : trend.type === 'negative' ? '▼' : ''} {trend.text}
            </span>
          )}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-[11px] text-slate-400 font-medium leading-tight">{description}</p>
        <div className="w-full h-1 bg-slate-100 mt-3 rounded-full overflow-hidden">
          <div className={`${barWidth} h-full ${barColor} transition-all duration-500`}></div>
        </div>
      </div>
    </div>
  );
}
