import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SectorSummary } from '@/types/portfolio';
import { formatCurrency } from '@/utils/formatters';

interface SectorChartProps {
  sectors: SectorSummary[];
}

const SECTOR_COLORS = [
  '#3b82f6', // blue       – Financial
  '#8b5cf6', // violet     – Tech
  '#f97316', // orange     – Consumer
  '#eab308', // yellow     – Power
  '#06b6d4', // cyan       – Pipe
  '#6b7280', // slate      – Others
];

const SectorChart: React.FC<SectorChartProps> = ({ sectors }) => {
  const chartData = sectors.map((s, i) => ({
    name: s.sector,
    value: s.totalInvestment,
    color: SECTOR_COLORS[i % SECTOR_COLORS.length],
    presentValue: s.totalPresentValue,
    gainLoss: s.totalGainLoss,
    stockCount: s.stocks.length,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-surface-elevated border border-surface-border rounded-lg p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-white mb-2">{d.name}</p>
          <p className="text-xs text-slate-400">Investment: <span className="text-slate-200 font-mono">{formatCurrency(d.value)}</span></p>
          <p className="text-xs text-slate-400">Present: <span className="text-slate-200 font-mono">{formatCurrency(d.presentValue)}</span></p>
          <p className={`text-xs font-semibold mt-1.5 font-mono ${(d.gainLoss ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            G/L: {(d.gainLoss ?? 0) >= 0 ? '+' : ''}{formatCurrency(d.gainLoss)}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">{d.stockCount} stocks</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
      {props.payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: entry.color }} />
          <span className="text-[11px] text-slate-500 font-mono">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-surface-card border border-surface-border/80 rounded-xl p-5 animate-fade-in card-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Sector Allocation</h3>
        <span className="stat-label">By Investment</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={62}
            outerRadius={102}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.9} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SectorChart;
