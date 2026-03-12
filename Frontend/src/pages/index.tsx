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
          <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">
            <div className="bg-surface-card border border-surface-border/80 rounded-2xl px-12 py-10 card-glow text-center max-w-sm w-full">
              {/* Spinner */}
              <div className="relative w-14 h-14 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-surface-elevated" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" />
                <div className="absolute inset-[5px] rounded-full border border-transparent border-t-violet-400/60 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
              </div>

              <p className="stat-label text-blue-400/70 mb-3">Fetching Live Prices</p>
              <h2 className="text-base font-semibold text-slate-100 mb-2 tracking-wide">
                Prices are updating
              </h2>
              <p className="text-xs text-slate-500 font-mono leading-relaxed">
                Fetching real-time data from<br />Yahoo Finance &amp; Google Finance…
              </p>

              {/* Animated dots */}
              <div className="flex items-center justify-center gap-1.5 mt-6">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-blue-500/60 animate-pulse-dot"
                    style={{ animationDelay: `${i * 300}ms` }}
                  />
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
