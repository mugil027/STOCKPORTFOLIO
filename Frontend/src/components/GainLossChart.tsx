import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { SectorSummary } from '@/types/portfolio';
import { formatCurrency } from '@/utils/formatters';

interface GainLossChartProps {
  sectors: SectorSummary[];
}

const GainLossChart: React.FC<GainLossChartProps> = ({ sectors }) => {
  const chartData = sectors.map((s) => ({
    name: s.sector.replace(' Sector', ''),
    gainLoss: s.totalGainLoss || 0,
    investment: s.totalInvestment,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const gl = d.gainLoss;
      return (
        <div className="bg-surface-elevated border border-surface-border rounded-lg p-3 shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-white mb-1.5">{label}</p>
          <p className={`text-sm font-mono tabular-nums font-semibold ${gl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {gl >= 0 ? '+' : ''}{formatCurrency(gl)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">on {formatCurrency(d.investment)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface-card border border-surface-border/80 rounded-xl p-5 animate-fade-in card-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Gain / Loss by Sector</h3>
        <span className="stat-label">P&amp;L ₹</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barCategoryGap="24%">
          <XAxis
            dataKey="name"
            tick={{ fill: '#334155', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#334155', fontSize: 11, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.04)' }} />
          <ReferenceLine y={0} stroke="#263a50" strokeDasharray="4 2" />
          <Bar dataKey="gainLoss" radius={[3, 3, 0, 0]} maxBarSize={48}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.gainLoss >= 0 ? '#10b981' : '#ef4444'}
                fillOpacity={entry.gainLoss >= 0 ? 1 : 0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GainLossChart;
