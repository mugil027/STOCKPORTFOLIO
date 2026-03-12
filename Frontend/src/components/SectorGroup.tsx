import React, { useState } from 'react';
import { SectorSummary } from '@/types/portfolio';
import {
  formatCurrency,
  formatPercent,
  getGainLossColor,
  getGainLossBg,
} from '@/utils/formatters';
import StockRow from './StockRow';

interface SectorGroupProps {
  sector: SectorSummary;
  index: number;
}

const sectorConfig: Record<
  string,
  { iconColor: string; iconBg: string; accent: string; gradient: string; icon: React.ReactNode }
> = {
  'Financial Sector': {
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/25',
    accent: 'border-l-blue-500',
    gradient: 'from-blue-500/8 to-transparent',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  'Tech Sector': {
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/25',
    accent: 'border-l-violet-500',
    gradient: 'from-violet-500/8 to-transparent',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
      </svg>
    ),
  },
  Consumer: {
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10 border-orange-500/25',
    accent: 'border-l-orange-500',
    gradient: 'from-orange-500/8 to-transparent',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  Power: {
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10 border-yellow-500/25',
    accent: 'border-l-yellow-500',
    gradient: 'from-yellow-500/8 to-transparent',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  'Pipe Sector': {
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/25',
    accent: 'border-l-cyan-500',
    gradient: 'from-cyan-500/8 to-transparent',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  Others: {
    iconColor: 'text-slate-400',
    iconBg: 'bg-slate-500/10 border-slate-500/25',
    accent: 'border-l-slate-500',
    gradient: 'from-slate-500/8 to-transparent',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
};

const TABLE_HEADERS = [
  { label: 'Particulars',    align: 'left'  as const },
  { label: 'Purchase Price', align: 'right' as const },
  { label: 'Qty',            align: 'right' as const },
  { label: 'Investment',     align: 'right' as const },
  { label: 'Portfolio %',    align: 'right' as const },
  { label: 'NSE/BSE',        align: 'left'  as const },
  { label: 'CMP',            align: 'right' as const },
  { label: 'Present Value',  align: 'right' as const },
  { label: 'Gain/Loss',      align: 'right' as const },
  { label: 'Gain/Loss %',    align: 'right' as const },
  { label: 'P/E Ratio',      align: 'right' as const },
  { label: 'EPS',            align: 'right' as const },
];

const SectorGroup: React.FC<SectorGroupProps> = ({ sector, index }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = sectorConfig[sector.sector] ?? sectorConfig['Others'];
  const glColor = getGainLossColor(sector.totalGainLoss);
  const glBg = getGainLossBg(sector.totalGainLoss);

  return (
    <div
      className="mb-5 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Sector Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-5 py-4 ${isExpanded ? 'rounded-t-xl' : 'rounded-xl'} bg-gradient-to-r ${config.gradient} bg-surface-card border-l-[3px] ${config.accent} border border-surface-border hover:brightness-110 transition-all duration-200 shadow-md`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-md ${config.iconBg} ${config.iconColor} border flex items-center justify-center flex-shrink-0`}>
            {config.icon}
          </div>
          <div className="text-left">
            <h2 className="text-[13px] font-semibold text-white tracking-wide">{sector.sector}</h2>
            <p className="text-[11px] text-slate-600 font-mono">
              {sector.stocks.length} stock{sector.stocks.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right hidden md:block">
            <p className="stat-label mb-0.5">Investment</p>
            <p className="text-sm font-mono tabular-nums text-slate-300">{formatCurrency(sector.totalInvestment)}</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="stat-label mb-0.5">Present Value</p>
            <p className="text-sm font-mono tabular-nums text-slate-300">{formatCurrency(sector.totalPresentValue)}</p>
          </div>
          <div className="text-right">
            <p className="stat-label mb-0.5">Gain / Loss</p>
            <div className="flex items-center gap-2">
              <p className={`text-sm font-mono tabular-nums font-semibold ${glColor}`}>
                {sector.totalGainLoss !== null && sector.totalGainLoss >= 0 ? '+' : ''}
                {formatCurrency(sector.totalGainLoss)}
              </p>
              <span className={`text-xs px-1.5 py-0.5 rounded-sm border font-mono tabular-nums font-medium ${glBg} ${glColor}`}>
                {formatPercent(sector.totalGainLossPercent)}
              </span>
            </div>
          </div>

          <svg
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Stocks Table */}
      {isExpanded && (
        <div className="border border-t-0 border-surface-border rounded-b-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#080d18]">
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h.label}
                      className={`py-2.5 px-4 whitespace-nowrap border-b border-surface-border/70 ${
                        h.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <span className="stat-label">{h.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/35">
                {sector.stocks.map((stock, i) => (
                  <StockRow key={stock.id} stock={stock} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorGroup;
