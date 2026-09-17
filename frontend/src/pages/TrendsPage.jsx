import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Calendar } from 'lucide-react';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function TrendsPage({ initialCommodity = 'Wheat' }) {
  const [commodity, setCommodity] = useState(initialCommodity);
  const [mandi, setMandi] = useState('');
  const [days, setDays] = useState(30);
  const [historyData, setHistoryData] = useState([]);
  const [commoditiesList, setCommoditiesList] = useState([]);
  const [mandisList, setMandisList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCommodities().then(setCommoditiesList).catch(() => []);
    api.getMandis().then(setMandisList).catch(() => []);
  }, []);

  useEffect(() => {
    if (!commodity) return;
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const res = await api.getPriceHistory(commodity, {
          mandi: mandi || undefined,
          days,
        });
        setHistoryData(res.history || []);
      } catch (err) {
        console.error('Failed to load trends', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [commodity, mandi, days]);

  const modalPrices = historyData.map((d) => d.modal_price).filter(Boolean);
  const currentPrice = modalPrices[modalPrices.length - 1] || 0;
  const startPrice = modalPrices[0] || 0;
  const priceChange = currentPrice - startPrice;
  const percentChange = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;
  const minPriceSeen = modalPrices.length ? Math.min(...modalPrices) : 0;
  const maxPriceSeen = modalPrices.length ? Math.max(...modalPrices) : 0;

  const dayRanges = [
    { label: 'Past 7 Days (7 दिन)', val: 7 },
    { label: 'Past 30 Days (30 दिन)', val: 30 },
    { label: 'Past 90 Days (3 महीने)', val: 90 },
    { label: 'Past 1 Year (1 साल)', val: 365 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Price Movement (भाव ट्रेंड)
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 mt-1">
            Is Your Crop Price Rising or Falling?
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track wholesale rates over time to decide the right moment to take produce to market
          </p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-neutral-100 border border-neutral-200 self-start sm:self-auto">
          {dayRanges.map((r) => (
            <button
              key={r.val}
              onClick={() => setDays(r.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                days === r.val
                  ? 'bg-black text-white shadow-sm'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="apple-glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/2">
          <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Select Crop (फसल)
          </label>
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#F7F7F7] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-black"
          >
            {commoditiesList.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-1/2">
          <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Select Specific Mandi (Optional - Default: All Mandis Average)
          </label>
          <select
            value={mandi}
            onChange={(e) => setMandi(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#F7F7F7] border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-black"
          >
            <option value="">All Reporting Mandis (Average Rate)</option>
            {mandisList.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name} ({m.district}, {m.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Easy-to-understand KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#F7F7F7] border border-neutral-200/80">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            Today's Rate (आज का भाव)
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-black mt-1">
            ₹{currentPrice.toLocaleString()}
          </div>
          <span className="text-[10px] text-neutral-500">प्रति क्विंटल (100 kg)</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#F7F7F7] border border-neutral-200/80">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            Change in {days} Days (बदलाव)
          </span>
          <div className="flex items-center space-x-1 mt-1">
            {priceChange > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            ) : priceChange < 0 ? (
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            ) : (
              <Minus className="w-4 h-4 text-neutral-400" />
            )}
            <span className="text-2xl sm:text-3xl font-bold font-mono text-black">
              {priceChange > 0 ? `+₹${priceChange}` : `₹${priceChange}`}
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500">
            {percentChange >= 0 ? `+${percentChange.toFixed(1)}% Up` : `${percentChange.toFixed(1)}% Down`}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#F7F7F7] border border-neutral-200/80">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            Period Low (न्यूनतम भाव)
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-black mt-1">
            ₹{minPriceSeen.toLocaleString()}
          </div>
          <span className="text-[10px] text-neutral-500">Lowest in this period</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#F7F7F7] border border-neutral-200/80">
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            Period High (अधिकतम भाव)
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-black mt-1">
            ₹{maxPriceSeen.toLocaleString()}
          </div>
          <span className="text-[10px] text-neutral-500">Highest in this period</span>
        </div>
      </div>

      {/* Monochrome Price Movement Chart */}
      <div className="apple-glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            <h3 className="text-sm font-semibold text-neutral-900">
              {commodity} Rate Chart ({days} Days Trend)
            </h3>
            {mandi && (
              <span className="text-xs text-neutral-500 font-mono">
                in {mandi}
              </span>
            )}
          </div>
          <div className="text-xs text-neutral-500 font-medium">
            Rates in ₹ / Quintal
          </div>
        </div>

        <div className="h-96 w-full pt-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-neutral-400">
              Loading price chart...
            </div>
          ) : historyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={historyData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="modalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E5' }}
                  tick={{ fill: '#8E8E93', fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  domain={['dataMin - 50', 'dataMax + 50']}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#8E8E93', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-black text-white p-3 rounded-xl text-xs space-y-1 shadow-xl font-mono">
                          <div className="text-neutral-400 text-[10px]">{label}</div>
                          <div className="text-sm font-bold text-white">
                            Today's Rate: ₹{d.modal_price?.toLocaleString()} /Q
                          </div>
                          <div className="text-[11px] text-neutral-300">
                            Min: ₹{d.minimum_price?.toLocaleString()} • Max: ₹{d.maximum_price?.toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '15px', fontSize: '11px' }}
                />
                <Area
                  type="monotone"
                  dataKey="modal_price"
                  name="Market Modal Rate (बाजार भाव)"
                  stroke="#000000"
                  strokeWidth={2.2}
                  fillOpacity={1}
                  fill="url(#modalFill)"
                />
                <Line
                  type="monotone"
                  dataKey="minimum_price"
                  name="Minimum Rate (न्यूनतम)"
                  stroke="#8E8E93"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="maximum_price"
                  name="Maximum Rate (अधिकतम)"
                  stroke="#8E8E93"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-xs text-neutral-400 space-y-1">
              <div>No price records available for {commodity} in this timeframe.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
