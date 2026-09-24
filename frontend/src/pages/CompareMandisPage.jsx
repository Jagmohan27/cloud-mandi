import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Award, MapPin, Calculator, ChevronRight, TrendingUp, Scale } from 'lucide-react';
import { api } from '../services/api';

const UNITS = {
  quintal: { label: 'Quintal (क्विंटल - 100kg)', short: '/Q', factor: 1 },
  maund: { label: 'Maund (मन - 40kg)', short: '/मन', factor: 0.4 },
  bag: { label: 'Bori (बोरी - 50kg)', short: '/बोरी', factor: 0.5 },
  kg: { label: 'Kilogram (किलो - 1kg)', short: '/kg', factor: 0.01 },
};

export default function CompareMandisPage({ onSelectCommodity }) {
  const [commodities, setCommodities] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [priceList, setPriceList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Profit Calculator & Unit state
  const [quantityQuintals, setQuantityQuintals] = useState(50);
  const [selectedUnit, setSelectedUnit] = useState('quintal');

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

  const unitInfo = UNITS[selectedUnit] || UNITS.quintal;
  const bestRate = priceList[0]?.modal_price || 0;
  const lowestRate = priceList[priceList.length - 1]?.modal_price || 0;
  const spreadDifference = Math.max(bestRate - lowestRate, 0);

  // Profit calculation based on harvest quantity in the selected unit
  const totalQuintals = (Number(quantityQuintals) || 0) * unitInfo.factor;
  const totalExtraProfit = Math.round(spreadDifference * totalQuintals);

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

      {/* Profit Calculator Banner */}
      {priceList.length > 1 && (
        <div className="p-6 rounded-3xl bg-[#F7F7F7] border border-neutral-200/80 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white flex-shrink-0">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  Total Profit Calculator (कमाई कैलकुलेटर)
                </div>
                <div className="text-xs text-neutral-500">
                  Calculate how much more money you make by selling in the top market
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Unit Toggle */}
              <div className="flex items-center space-x-1 p-1 rounded-xl bg-white border border-neutral-200 text-xs">
                {Object.entries(UNITS).map(([key, u]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedUnit(key)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedUnit === key
                        ? 'bg-black text-white shadow-sm'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    {u.short.replace('/', '')}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-xs text-neutral-600 font-medium whitespace-nowrap">
                  Quantity ({unitInfo.label.split(' ')[0]}):
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={quantityQuintals}
                  onChange={(e) => setQuantityQuintals(Math.max(1, Number(e.target.value)))}
                  className="w-24 px-3 py-1.5 rounded-lg bg-white border border-neutral-300 text-xs font-bold font-mono text-black text-center focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-white rounded-xl border border-neutral-100">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">
                Highest Rate ({unitInfo.short.replace('/', '')})
              </span>
              <div className="text-lg font-bold font-mono text-black">
                ₹{Math.round(bestRate * unitInfo.factor).toLocaleString()} {unitInfo.short}
              </div>
              {selectedUnit !== 'quintal' && (
                <div className="text-[10px] text-neutral-400 font-mono mt-0.5">₹{bestRate.toLocaleString()} /Q</div>
              )}
            </div>

            <div className="p-3 bg-white rounded-xl border border-neutral-100">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">
                Price Difference ({unitInfo.short.replace('/', '')})
              </span>
              <div className="text-lg font-bold font-mono text-neutral-700">
                +₹{Math.round(spreadDifference * unitInfo.factor).toLocaleString()} {unitInfo.short}
              </div>
              {selectedUnit !== 'quintal' && (
                <div className="text-[10px] text-neutral-400 font-mono mt-0.5">+₹{spreadDifference.toLocaleString()} /Q</div>
              )}
            </div>

            <div className="p-3 bg-neutral-950 text-white rounded-xl border border-black">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">
                Estimated Extra Profit on {quantityQuintals} {unitInfo.label.split(' ')[0]}
              </span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                +₹{totalExtraProfit.toLocaleString()}
              </div>
            </div>
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
                      ₹{item.modal_price?.toLocaleString()} <span className="text-xs font-normal text-neutral-500">/Q</span>
                    </span>
                    {selectedUnit !== 'quintal' && (
                      <span className="text-xs font-bold font-mono text-emerald-700 block">
                        ₹{Math.round(item.modal_price * unitInfo.factor).toLocaleString()} {unitInfo.short}
                      </span>
                    )}
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
