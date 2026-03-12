import React from 'react';
import { EnrichedStock } from '@/types/portfolio';
import {
  formatCurrency,
  formatCurrencyDecimal,
  formatPercent,
  formatRatio,
  getGainLossColor,
  getGainLossBg,
} from '@/utils/formatters';

interface StockRowProps {
  stock: EnrichedStock;
  index: number;
}

const StockRow: React.FC<StockRowProps> = ({ stock, index }) => {
  const glColor = getGainLossColor(stock.gainLoss);
  const glBg = getGainLossBg(stock.gainLoss);
  const isGain = (stock.gainLoss ?? 0) >= 0;
  const cmpIsLive = stock.cmpSource && stock.cmpSource !== 'mock';

  return (
    <tr
      className="bg-surface-card hover:bg-[#111d2e] transition-colors duration-150 group"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Particulars */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-600/25 to-blue-900/20 border border-blue-500/20 flex items-center justify-center text-[10px] font-mono font-bold text-blue-300 flex-shrink-0">
            {stock.name.substring(0, 2).toUpperCase()}
          </div>
          <p className="text-[13px] font-medium text-slate-100 leading-tight">{stock.name}</p>
        </div>
      </td>

      {/* Purchase Price */}
      <td className="py-3 px-4 text-right">
        <span className="text-sm text-slate-500 font-mono tabular-nums">
          {formatCurrencyDecimal(stock.purchasePrice)}
        </span>
      </td>

      {/* Qty */}
      <td className="py-3 px-4 text-right">
        <span className="text-sm text-slate-500 font-mono tabular-nums">{stock.quantity}</span>
      </td>

      {/* Investment */}
      <td className="py-3 px-4 text-right">
        <span className="text-sm text-slate-300 font-mono tabular-nums">{formatCurrency(stock.investment)}</span>
      </td>

      {/* Portfolio % */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="w-14 h-1 rounded-full bg-surface-elevated overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
              style={{ width: `${Math.min(stock.portfolioPercent * 3, 100)}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums w-10 text-right">
            {stock.portfolioPercent.toFixed(1)}%
          </span>
        </div>
      </td>

      {/* NSE/BSE Code */}
      <td className="py-3 px-4">
        <span className="ticker-badge">{stock.exchangeCode}</span>
      </td>

      {/* CMP */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <span className={`text-sm font-mono tabular-nums font-semibold text-white ${cmpIsLive ? (isGain ? 'gain-glow' : 'loss-glow') : ''}`}>
            {formatCurrencyDecimal(stock.cmp)}
          </span>
          {cmpIsLive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot flex-shrink-0" />
          )}
        </div>
      </td>

      {/* Present Value */}
      <td className="py-3 px-4 text-right">
        <span className="text-sm text-slate-300 font-mono tabular-nums">{formatCurrency(stock.presentValue)}</span>
      </td>

      {/* Gain/Loss */}
      <td className="py-3 px-4 text-right">
        <span className={`text-sm font-mono tabular-nums font-semibold ${glColor}`}>
          {stock.gainLoss !== null && stock.gainLoss >= 0 ? '+' : ''}
          {formatCurrency(stock.gainLoss)}
        </span>
      </td>

      {/* Gain/Loss % */}
      <td className="py-3 px-4 text-right">
        <span className={`text-xs px-2 py-0.5 rounded-[3px] border font-mono tabular-nums font-medium ${glBg} ${glColor}`}>
          {formatPercent(stock.gainLossPercent)}
        </span>
      </td>

      {/* P/E Ratio */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-sm text-slate-500 font-mono tabular-nums">{formatRatio(stock.peRatio)}</span>
          {stock.peSource && stock.peSource !== 'mock' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot flex-shrink-0" />
          )}
        </div>
      </td>

      {/* EPS */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-sm text-slate-500 font-mono tabular-nums">
            {stock.latestEarnings !== null ? `₹${stock.latestEarnings.toFixed(2)}` : '—'}
          </span>
          {stock.epsSource && stock.epsSource !== 'mock' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot flex-shrink-0" />
          )}
        </div>
      </td>
    </tr>
  );
};

export default StockRow;
