import React, { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, Store, Award, CheckCircle2, ChevronRight, Search, ShieldCheck, ArrowUpRight, ArrowDownRight, Flame } from 'lucide-react';
import { api } from '../services/api';
import { compareWithMSP } from '../utils/mspData';

export default function LandingPage({ setActiveTab, onSelectCommodity }) {
  const [stats, setStats] = useState(null);
  const [latestPrices, setLatestPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, pricesData] = await Promise.all([
          api.getStatistics().catch(() => null),
          api.getLatestPrices(8).catch(() => []),
        ]);
        setStats(statsData);
        setLatestPrices(pricesData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const popularCrops = ['Wheat', 'Onion', 'Potato', 'Tomato', 'Cotton', 'Soyabean', 'Mustard', 'Paddy (Dhan)'];

  const movers = latestPrices
    .map((item) => {
      const msp = compareWithMSP(item.modal_price, item.commodity);
      return {
        ...item,
        mspPercent: msp ? msp.percent : 0,
        isAboveMSP: msp ? msp.isAbove : null,
        mspRate: msp ? msp.mspRate : null,
      };
    })
    .filter((i) => i.mspRate !== null);

  const gainers = [...movers]
    .filter((m) => m.isAboveMSP)
    .sort((a, b) => b.mspPercent - a.mspPercent)
    .slice(0, 3);

  const laggards = [...movers]
    .filter((m) => !m.isAboveMSP)
    .sort((a, b) => a.mspPercent - b.mspPercent)
    .slice(0, 3);

  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto pt-10 pb-6 px-4">
        {/* Trust Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-700 mb-8">
          <ShieldCheck className="w-4 h-4 text-neutral-800" />
          <span>Official Government APMC Market Rates (AGMARKNET)</span>
        </div>

        {/* Hero Headings */}
        <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight text-neutral-950 leading-[1.08] mb-6">
          Today's Mandi Prices,
          <br />
          <span className="text-neutral-400">delivered simply.</span>
        </h1>

        <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto font-normal leading-relaxed mb-8">
          Check daily wholesale crop prices across Indian mandis before taking your harvest to market. Always know the best rate.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab('prices')}
            className="apple-btn-primary w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-medium flex items-center justify-center space-x-2 shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span>Check Crop Rates</span>
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className="apple-btn-secondary w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-medium flex items-center justify-center space-x-2"
          >
            <span>Compare Nearby Mandis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Tap Crop Quick Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-xs text-neutral-400 font-medium mr-1">Popular Crops:</span>
          {popularCrops.map((crop) => (
            <button
              key={crop}
              onClick={() => {
                if (onSelectCommodity) onSelectCommodity(crop);
                setActiveTab('prices');
              }}
              className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 hover:bg-black hover:text-white text-neutral-700 transition-colors"
            >
              {crop}
            </button>
          ))}
        </div>
      </section>

      {/* 4 Farmer-focused Benefit Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Accurate Rates */}
          <div className="apple-glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-4 text-neutral-900">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">
                Daily Mandi Rates
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Updated directly from agricultural market committees across all Indian states and districts every day.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
              Standard Unit: ₹ / Quintal (100 kg)
            </div>
          </div>

          {/* Card 2: Highest Price Finder */}
          <div className="apple-glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-4 text-neutral-900">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">
                Highest Price Finder
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Compare mandis side-by-side to see which market yard gives you the best return on your produce.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
              Sorted by Maximum Rate
            </div>
          </div>

          {/* Card 3: Price Direction */}
          <div className="apple-glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-4 text-neutral-900">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">
                Price Direction (भाव ट्रेंड)
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Understand if prices are rising or falling over the last 7 to 30 days before deciding when to sell.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
              Weekly & Monthly Trendlines
            </div>
          </div>

          {/* Card 4: Verified Source */}
          <div className="apple-glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-4 text-neutral-900">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">
                Verified Government Data
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Aggregated from official Ministry of Agriculture & Farmers Welfare records without middleman distortions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-neutral-100 text-[11px] text-neutral-500 font-medium">
              data.gov.in / AGMARKNET
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Statistics Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#F7F7F7] border border-neutral-200/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-neutral-200/80 gap-3">
            <div>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Nationwide Market Coverage
              </span>
              <h2 className="text-2xl font-semibold text-neutral-950 mt-0.5">
                Live Agricultural Network
              </h2>
            </div>
            <div className="text-xs text-neutral-500">
              Latest Market Report: <strong className="text-neutral-900 font-mono">{stats?.latest_price_date || 'Today'}</strong>
            </div>
          </div>

          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-mono">
                  {stats.total_commodities.toLocaleString()}
                </div>
                <div className="text-xs font-medium text-neutral-500 mt-1">
                  Crops & Produce Tracked
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-mono">
                  {stats.total_mandis.toLocaleString()}+
                </div>
                <div className="text-xs font-medium text-neutral-500 mt-1">
                  APMC Market Yards
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-mono">
                  {stats.total_price_records.toLocaleString()}+
                </div>
                <div className="text-xs font-medium text-neutral-500 mt-1">
                  Verified Price Records
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-mono">
                  {stats.states_covered}
                </div>
                <div className="text-xs font-medium text-neutral-500 mt-1">
                  States & Union Territories
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-neutral-400 font-mono">
              Loading market statistics...
            </div>
          )}
        </div>
      </section>

      {/* Today's Market Movers (Top Premiums vs Govt MSP) */}
      {movers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                Market Pulse: Rates vs Official MSP
              </h2>
              <p className="text-xs text-neutral-500">
                Real-time price premiums and government support floor comparison
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Gainers Above MSP */}
            <div className="apple-glass-card rounded-2xl p-5 border-emerald-200/50">
              <div className="flex items-center space-x-2 text-emerald-800 text-xs font-semibold mb-3">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span>Top Premiums (MSP से अधिक भाव)</span>
              </div>
              <div className="space-y-2.5">
                {gainers.length > 0 ? (
                  gainers.map((item) => (
                    <div
                      key={`gainer-${item.id}`}
                      onClick={() => {
                        if (onSelectCommodity) onSelectCommodity(item.commodity);
                        setActiveTab('prices');
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/70 hover:bg-emerald-50/50 transition-colors cursor-pointer border border-neutral-100"
                    >
                      <div>
                        <div className="text-xs font-semibold text-neutral-900">{item.commodity}</div>
                        <div className="text-[11px] text-neutral-500">{item.mandi} Mandi, {item.state}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-neutral-900">₹{item.modal_price?.toLocaleString()}/Q</div>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          +{item.mspPercent}% vs MSP
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-neutral-400 py-3 text-center">Trading around official benchmark rates</div>
                )}
              </div>
            </div>

            {/* Trading Near / Below MSP */}
            <div className="apple-glass-card rounded-2xl p-5 border-amber-200/50">
              <div className="flex items-center space-x-2 text-amber-800 text-xs font-semibold mb-3">
                <ArrowDownRight className="w-4 h-4 text-amber-600" />
                <span>Value & Below MSP (समर्थन मूल्य के करीब/नीचे)</span>
              </div>
              <div className="space-y-2.5">
                {laggards.length > 0 ? (
                  laggards.map((item) => (
                    <div
                      key={`laggard-${item.id}`}
                      onClick={() => {
                        if (onSelectCommodity) onSelectCommodity(item.commodity);
                        setActiveTab('prices');
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/70 hover:bg-amber-50/50 transition-colors cursor-pointer border border-neutral-100"
                    >
                      <div>
                        <div className="text-xs font-semibold text-neutral-900">{item.commodity}</div>
                        <div className="text-[11px] text-neutral-500">{item.mandi} Mandi, {item.state}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-neutral-900">₹{item.modal_price?.toLocaleString()}/Q</div>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          {item.mspPercent}% vs MSP
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-neutral-500 py-4 text-center">All major mandi arrivals are currently selling safely above government MSP floor prices!</div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Mandi Rates Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Today's Mandi Rates Snapshot
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Current wholesale modal prices reported across mandis
            </p>
          </div>
          <button
            onClick={() => setActiveTab('prices')}
            className="text-xs font-medium text-neutral-800 hover:text-black flex items-center space-x-1 group"
          >
            <span>View All Mandi Rates</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="apple-glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-neutral-200/80 text-neutral-500 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Crop / Commodity</th>
                  <th className="py-3.5 px-6">Mandi Name</th>
                  <th className="py-3.5 px-6">District & State</th>
                  <th className="py-3.5 px-6 text-right">Modal Rate (बाजार भाव)</th>
                  <th className="py-3.5 px-6 text-right">Price Range (Min - Max)</th>
                  <th className="py-3.5 px-6 text-right">Arrival Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {latestPrices.length > 0 ? (
                  latestPrices.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => {
                        if (onSelectCommodity) onSelectCommodity(item.commodity);
                        setActiveTab('prices');
                      }}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-6 font-semibold text-neutral-900">
                        {item.commodity}
                        <span className="text-[10px] text-neutral-400 block font-normal">
                          {item.variety}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-medium text-neutral-900">{item.mandi}</td>
                      <td className="py-3.5 px-6 text-neutral-500">
                        {item.district}, {item.state}
                      </td>
                      <td className="py-3.5 px-6 text-right font-bold font-mono text-neutral-950 text-sm">
                        ₹{item.modal_price?.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-neutral-500">/ क्विंटल</span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono text-neutral-500">
                        ₹{item.minimum_price?.toLocaleString()} - ₹{item.maximum_price?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono text-neutral-400">
                        {item.date}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      Loading latest mandi rates...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
