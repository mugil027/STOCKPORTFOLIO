import React from 'react';
import Head from 'next/head';
import { usePortfolio } from '@/hooks/usePortfolio';
import DashboardHeader from '@/components/DashboardHeader';
import SectorGroup from '@/components/SectorGroup';
import SectorChart from '@/components/SectorChart';
import GainLossChart from '@/components/GainLossChart';
import ErrorDisplay from '@/components/ErrorDisplay';

export default function Home() {
  const { data, loading, error, lastFetched, isRefreshing, refresh } =
    usePortfolio({ autoRefreshInterval: 300000 }); // 20 minutes

  return (
    <>
      <Head>
        <title>Portfolio Dashboard | Real-Time Stock Tracker</title>
        <meta
          name="description"
          content="Dynamic portfolio dashboard with real-time stock data from Yahoo Finance and Google Finance"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="max-w-[1440px] mx-auto px-8 py-10">
        {/* Initial Load State */}
        {loading && !data && (
          <div className="fixed inset-0 overflow-hidden flex items-center justify-center z-50" style={{ backgroundColor: '#0a0d1a' }}>

            {/* All background elements — globally faded */}
            <div className="absolute inset-0 opacity-30">

            {/* Grid */}
            <div className="absolute inset-0 grid-bg" />

            {/* Background chart SVG */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 800">
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,560 L72,530 L144,545 L216,490 L288,455 L360,470 L432,410 L504,375 L576,390 L648,330 L720,345 L792,285 L864,250 L936,268 L1008,205 L1080,222 L1152,165 L1224,182 L1296,128 L1368,145 L1440,100 L1440,800 L0,800 Z"
                fill="url(#chartFill)"
              />
              <polyline
                className="chart-line-draw"
                points="0,560 72,530 144,545 216,490 288,455 360,470 432,410 504,375 576,390 648,330 720,345 792,285 864,250 936,268 1008,205 1080,222 1152,165 1224,182 1296,128 1368,145 1440,100"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {[[72,530],[216,490],[360,470],[504,375],[648,330],[792,285],[936,268],[1080,222],[1224,182],[1440,100]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="3.5" fill="#0a0d1a" stroke="#60a5fa" strokeWidth="2" opacity="0.9" />
              ))}
            </svg>

            {/* Candlestick decorations */}
            {[
              { x: '6%',  y: '25%', h: 60, green: true,  delay: '0.2s', dur: '3.2s' },
              { x: '12%', y: '55%', h: 40, green: false, delay: '1.0s', dur: '2.8s' },
              { x: '20%', y: '30%', h: 70, green: true,  delay: '0.6s', dur: '3.6s' },
              { x: '78%', y: '20%', h: 55, green: true,  delay: '0.4s', dur: '3.0s' },
              { x: '85%', y: '60%', h: 45, green: false, delay: '1.4s', dur: '2.6s' },
              { x: '92%', y: '35%', h: 65, green: true,  delay: '0.8s', dur: '3.4s' },
            ].map((c, i) => (
              <div
                key={i}
                className="absolute candle-rise flex flex-col items-center gap-0.5"
                style={{ left: c.x, top: c.y, animationDelay: c.delay, animationDuration: c.dur, transformOrigin: 'bottom' }}
              >
                <div className="w-px bg-current opacity-40" style={{ height: 10, color: c.green ? '#22c55e' : '#ef4444' }} />
                <div className="w-3 rounded-sm" style={{ height: c.h * 0.4, backgroundColor: c.green ? '#22c55e' : '#ef4444', opacity: 0.8 }} />
                <div className="w-px bg-current opacity-40" style={{ height: 8, color: c.green ? '#22c55e' : '#ef4444' }} />
              </div>
            ))}

            {/* Floating ticker chips */}
            {[
              { symbol: 'HDFCBANK',  change: '+1.24%', pos: true,  x: '7%',  y: '22%', delay: '0s',   dur: '5s'   },
              { symbol: 'BAJFINANCE',change: '+2.10%', pos: true,  x: '72%', y: '14%', delay: '0.8s', dur: '5.5s' },
              { symbol: 'ICICIBANK', change: '-0.38%', pos: false, x: '14%', y: '68%', delay: '1.6s', dur: '4.8s' },
              { symbol: 'LTIM',      change: '+0.87%', pos: true,  x: '80%', y: '62%', delay: '0.4s', dur: '5.2s' },
              { symbol: 'DMART',     change: '-1.12%', pos: false, x: '55%', y: '78%', delay: '2.0s', dur: '4.5s' },
              { symbol: 'TATAPOWER', change: '+3.45%', pos: true,  x: '4%',  y: '48%', delay: '1.2s', dur: '5.8s' },
              { symbol: 'SUZLON',    change: '+1.76%', pos: true,  x: '88%', y: '36%', delay: '2.4s', dur: '4.6s' },
              { symbol: 'KPITTECH',  change: '-0.55%', pos: false, x: '38%', y: '8%',  delay: '0.6s', dur: '5.4s' },
              { symbol: 'ASTRAL',    change: '+0.92%', pos: true,  x: '62%', y: '88%', delay: '1.8s', dur: '5.0s' },
            ].map((t) => (
              <div
                key={t.symbol}
                className="ticker-float absolute flex items-center gap-2 rounded-lg px-3 py-1.5"
                style={{
                  left: t.x, top: t.y,
                  animationDelay: t.delay, animationDuration: t.dur,
                  backgroundColor: 'rgba(15,23,42,0.9)',
                  border: `1px solid ${t.pos ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
                }}
              >
                <span className="text-xs font-mono font-semibold text-slate-300">{t.symbol}</span>
                <span className={`text-xs font-mono font-bold ${t.pos ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.change}
                </span>
              </div>
            ))}

            {/* Floating price values */}
            {[
              { val: '₹1,748.60', x: '30%', y: '18%', delay: '1.0s' },
              { val: '₹6,892.35', x: '66%', y: '42%', delay: '2.2s' },
              { val: '₹875.20',  x: '22%', y: '82%', delay: '0.5s' },
            ].map((p, i) => (
              <div
                key={i}
                className="price-tick absolute text-xs font-mono font-medium text-blue-400 px-2 py-1 rounded-md"
                style={{ left: p.x, top: p.y, animationDelay: p.delay, backgroundColor: 'rgba(30,58,138,0.3)', border: '1px solid rgba(59,130,246,0.25)' }}
              >
                {p.val}
              </div>
            ))}

            </div>

            {/* Center card */}
            <div className="relative z-10 rounded-2xl px-12 py-10 text-center max-w-sm w-full" style={{ backgroundColor: '#0d1529', border: '1px solid rgba(59,130,246,0.18)', boxShadow: '0 0 0 1px rgba(59,130,246,0.06), 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)' }}>
              {/* Spinner */}
              <div className="relative w-14 h-14 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
                <div
                  className="absolute inset-[5px] rounded-full border-2 border-transparent border-t-violet-400 animate-spin"
                  style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-mono font-bold text-blue-400">₹</span>
                </div>
              </div>

              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-400/70 mb-2">
                Fetching Live Prices
              </p>
              <h2 className="text-lg font-semibold text-slate-100 mb-2 tracking-tight">
                Prices are updating
              </h2>
              <p className="text-xs text-slate-500 font-mono leading-relaxed">
                Fetching real-time data from<br />Yahoo Finance &amp; Google Finance…
              </p>

              {/* Animated dots */}
              <div className="flex items-center justify-center gap-1.5 mt-5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-500/60 animate-pulse-dot"
                    style={{ animationDelay: `${i * 300}ms` }}
                  />
                ))}
              </div>

              {/* Bottom data source badges */}
              <div className="flex items-center justify-center gap-2 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {['Yahoo Finance', 'Google Finance', 'Finnhub'].map((src) => (
                  <span key={src} className="text-[9px] font-mono text-slate-600 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !data && (
          <ErrorDisplay message={error} onRetry={refresh} />
        )}

        {/* Data Loaded */}
        {data && (
          <>
            {/* Header with Summary Cards */}
            <DashboardHeader
              data={data}
              lastFetched={lastFetched}
              isRefreshing={isRefreshing}
              onRefresh={refresh}
            />

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              <SectorChart sectors={data.sectors} />
              <GainLossChart sectors={data.sectors} />
            </div>

            {/* Holdings */}
            <div>
              <div className="flex items-center justify-between border-b border-surface-border/50 pb-3 mb-5">
                <p className="stat-label">Holdings by Sector</p>
                {isRefreshing && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-3 h-3 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
                    Updating prices...
                  </div>
                )}
              </div>

              {data.sectors.map((sector, index) => (
                <SectorGroup key={sector.sector} sector={sector} index={index} />
              ))}
            </div>

            {/* Footer */}
            <footer className="mt-12 pt-5 border-t border-surface-border/40 text-center">
              <p className="text-xs text-slate-600">
                CMP — Yahoo Finance &nbsp;·&nbsp; P/E &amp; EPS — Google Finance with Yahoo quoteSummary fallback.
                Prices refresh every 5 minutes.
                {data.dataSource === 'mock' && (
                  <span className="text-amber-500/80 ml-1">
                    Currently showing mock data — live APIs may be unavailable.
                  </span>
                )}
              </p>
            </footer>
          </>
        )}
      </main>
    </>
  );
}
