import React from 'react';
import { PortfolioResponse } from '@/types/portfolio';
import {
  formatCurrency,
  formatPercent,
  formatTime,
  getGainLossColor,
} from '@/utils/formatters';

interface DashboardHeaderProps {
  data: PortfolioResponse | null;
  lastFetched: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  data,
  lastFetched,
  isRefreshing,
  onRefresh,
}) => {
  const totals = data?.totals;
  const glColor = getGainLossColor(totals?.totalGainLoss);
  const isProfit = (totals?.totalGainLoss ?? 0) >= 0;

  return (
    <header className="mb-8">
      {/* Hero Title Band */}
      <div className="relative rounded-2xl overflow-hidden mb-6 card-glow">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1526] via-[#0f1a2e] to-[#0a0d1a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.07),transparent_60%)]" />
        <div className="absolute inset-0 border border-surface-border rounded-2xl" />

        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Portfolio{' '}
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 tracking-widest uppercase font-mono ml-[42px]">
              Real-time &middot; NSE / BSE &middot; Live prices
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Live data legend */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/8 border border-emerald-500/25 text-xs backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
              <span className="text-emerald-400 font-medium">Real-time</span>
            </div>

            {/* Data Source Badge */}
            {data && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-surface-elevated border border-surface-border text-xs">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    data.dataSource === 'live'
                      ? 'bg-emerald-400 animate-pulse-dot'
                      : data.dataSource === 'mock'
                      ? 'bg-amber-400'
                      : 'bg-blue-400 animate-pulse-dot'
                  }`}
                />
                <span className="text-slate-300 font-medium">
                  {data.dataSource === 'live'
                    ? 'Live Data'
                    : data.dataSource === 'mock'
                    ? 'Mock Data'
                    : 'Mixed'}
                </span>
              </div>
            )}

            {/* Last Updated */}
            {lastFetched && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-mono">{formatTime(lastFetched)}</span>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-500 text-xs text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30 border border-blue-500/30"
            >
              <svg
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRefreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {totals && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Investment"
            value={formatCurrency(totals.totalInvestment)}
            subtext={`${data!.sectors.reduce((sum, s) => sum + s.stocks.length, 0)} stocks · ${data!.sectors.length} sectors`}
            valueColor="text-slate-100"
            accentColor="blue"
            icon={
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
              </svg>
            }
          />
          <SummaryCard
            label="Present Value"
            value={formatCurrency(totals.totalPresentValue)}
            subtext="Current market value"
            valueColor="text-violet-300"
            accentColor="violet"
            icon={
              <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            }
          />
          <SummaryCard
            label="Total Gain / Loss"
            value={(totals.totalGainLoss !== null && totals.totalGainLoss >= 0 ? '+' : '') + formatCurrency(totals.totalGainLoss)}
            subtext={formatPercent(totals.totalGainLossPercent)}
            valueColor={glColor}
            accentColor={isProfit ? 'emerald' : 'red'}
            icon={
              <svg className={`w-4 h-4 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                {isProfit
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
                }
              </svg>
            }
          />
          <SummaryCard
            label="Overall Return"
            value={formatPercent(totals.totalGainLossPercent)}
            subtext={isProfit ? 'Portfolio in profit' : 'Portfolio in loss'}
            valueColor={glColor}
            accentColor={isProfit ? 'emerald' : 'red'}
            icon={
              <svg className={`w-4 h-4 ${isProfit ? 'text-emerald-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-4.125-2.062a4.125 4.125 0 00-3.75 0L8.625 21.75a4.125 4.125 0 00-3.75 0L.75 21.75V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            }
          />
        </div>
      )}
    </header>
  );
};

type AccentColor = 'blue' | 'violet' | 'emerald' | 'red';

interface SummaryCardProps {
  label: string;
  value: string;
  subtext: string;
  valueColor: string;
  accentColor: AccentColor;
  icon: React.ReactNode;
}

const accentMap: Record<AccentColor, { bar: string; iconBg: string; border: string }> = {
  blue:    { bar: 'from-blue-500 via-blue-400/40 to-transparent',    iconBg: 'bg-blue-500/10 border-blue-500/25',    border: 'border-blue-500/20'    },
  violet:  { bar: 'from-violet-500 via-violet-400/40 to-transparent', iconBg: 'bg-violet-500/10 border-violet-500/25', border: 'border-violet-500/20'  },
  emerald: { bar: 'from-emerald-500 via-emerald-400/40 to-transparent',iconBg: 'bg-emerald-500/10 border-emerald-500/25',border: 'border-emerald-500/20'},
  red:     { bar: 'from-red-500 via-red-400/40 to-transparent',       iconBg: 'bg-red-500/10 border-red-500/25',       border: 'border-red-500/20'     },
};

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, subtext, valueColor, accentColor, icon }) => {
  const a = accentMap[accentColor];
  return (
    <div className={`relative bg-surface-card border ${a.border} rounded-xl p-5 animate-fade-in hover:brightness-110 transition-all duration-200 card-glow overflow-hidden`}>
      {/* Top gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${a.bar}`} />

      <div className="flex items-start justify-between mb-3">
        <p className="stat-label">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${a.iconBg} border flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${valueColor} mb-1`}>
        {value}
      </p>
      <p className="text-xs text-slate-500">{subtext}</p>
    </div>
  );
};

export default DashboardHeader;
