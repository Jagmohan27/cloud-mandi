import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Award, MapPin, Search, ChevronRight, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

export default function CompareMandisPage({ onSelectCommodity }) {
  const [commodities, setCommodities] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [priceList, setPriceList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCommodities().then(setCommodities).catch(() => []);
    api.getStates().then(setStates).catch(() => []);
  }, []);

  useEffect(() => {
    if (!selectedCrop) return;
    setLoading(true);
    api.getPrices({
      commodity: selectedCrop,
      state: selectedState || undefined,
      sort_by: 'price_desc',
      limit: 50,
    })
      .then((res) => setPriceList(res.results || []))
      .catch(() => setPriceList([]))
      .finally(() => setLoading(false));
  }, [selectedCrop, selectedState]);

  const bestRate = priceList[0]?.modal_price || 0;
  const lowestRate = priceList[priceList.length - 1]?.modal_price || 0;
  const spreadDifference = bestRate - lowestRate;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Best Price Finder (मंडी भाव तुलना)
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 mt-1">
          Compare Mandi Prices Side-by-Side
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Find which market yard is currently paying the highest price for your harvest
        </p>
      </div>

      {/* Filter Controls */}
      <div className="apple-glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/2">
          <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider mb-1">
            1. Select Your Crop (फसल चुनें)
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F7] border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-black"
          >
            {commodities.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-1/2">
          <label className="block text-[11px] font-semibold text-neutral-600 uppercase tracking-wider mb-1">
            2. Filter by State (राज्य चुनें - Optional)
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F7F7] border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-black"
          >
            <option value="">All Indian States (सभी राज्य)</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Value Spread Banner */}
      {priceList.length > 1 && (
        <div className="p-5 rounded-2xl bg-[#F7F7F7] border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white flex-shrink-0">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900">
                Market Price Difference for {selectedCrop}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                Selling in the top mandi gives you up to{' '}
                <strong className="text-black font-mono">₹{spreadDifference.toLocaleString()} more per quintal</strong> compared to the lowest reporting market.
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right font-mono">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
              Highest Rate Found
            </span>
            <span className="text-2xl font-bold text-neutral-950">
              ₹{bestRate.toLocaleString()}
            </span>
            <span className="text-[10px] text-neutral-500 block">/ Quintal</span>
          </div>
        </div>
      )}

      {/* Comparison Mandi Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-xs text-neutral-400 font-mono">
            Comparing prices across mandis...
          </div>
        ) : priceList.length > 0 ? (
          priceList.map((item, index) => {
            const isHighest = index === 0;
            const diffFromBest = bestRate - item.modal_price;

            return (
              <div
                key={item.id}
                className={`apple-glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isHighest ? 'border-neutral-900 ring-1 ring-neutral-900' : 'hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start sm:items-center space-x-4">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                      isHighest
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-semibold text-neutral-950">
                        {item.mandi} Mandi
                      </h3>
                      {isHighest && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black text-white uppercase tracking-wider">
                          Highest Price (सर्वश्रेष्ठ भाव)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-neutral-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{item.district}, {item.state}</span>
                      <span>•</span>
                      <span>Variety: {item.variety}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                      Range (Min - Max)
                    </span>
                    <span className="text-xs font-mono text-neutral-600">
                      ₹{item.minimum_price?.toLocaleString()} - ₹{item.maximum_price?.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider block">
                      Today's Rate
                    </span>
                    <span className="text-xl font-bold font-mono text-neutral-950">
                      ₹{item.modal_price?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-neutral-400 block font-mono">
                      {diffFromBest === 0 ? 'Top Rate' : `-₹${diffFromBest} /Q`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-xs text-neutral-400 font-mono">
            No prices found for {selectedCrop}. Try selecting another crop.
          </div>
        )}
      </div>
    </div>
  );
}
