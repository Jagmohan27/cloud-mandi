import React, { useState, useEffect } from 'react';
import { Store, MapPin, Search, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

export default function MarketsPage({ onSelectMandi }) {
  const [mandis, setMandis] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getStates().then(setStates).catch(() => []);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getMandis(selectedState || undefined)
      .then((data) => setMandis(data || []))
      .catch(() => setMandis([]))
      .finally(() => setLoading(false));
  }, [selectedState]);

  const filteredMandis = mandis.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.district.toLowerCase().includes(q) ||
      m.state.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
          Agricultural Mandis & APMCs
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Government regulated market yards reporting wholesale daily prices
        </p>
      </div>

      {/* Filter and Search */}
      <div className="apple-glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-2/3">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mandi or district name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F7F7] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-black"
          />
        </div>
        <div className="w-full sm:w-1/3">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#F7F7F7] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-black"
          >
            <option value="">All Indian States</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mandi Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMandis.length > 0 ? (
          filteredMandis.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectMandi(m.name)}
              className="apple-glass-card rounded-2xl p-5 hover:border-neutral-400 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-3 group-hover:bg-black group-hover:text-white transition-colors">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                    APMC Yard
                  </span>
                </div>
                <h3 className="text-base font-semibold text-neutral-900 group-hover:text-black">
                  {m.name} Mandi
                </h3>
                <div className="flex items-center space-x-1.5 text-xs text-neutral-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{m.district}, {m.state}</span>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span className="text-[11px] font-mono">View Market Prices</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-xs text-neutral-400 font-mono">
            No registered mandis found matching your query.
          </div>
        )}
      </div>
    </div>
  );
}
