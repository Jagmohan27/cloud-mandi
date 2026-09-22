import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, X, ChevronLeft, ChevronRight, Download, Printer, SlidersHorizontal } from 'lucide-react';
import { api } from '../services/api';
import PriceDetailModal from '../components/common/PriceDetailModal';

export default function PriceExplorerPage({ initialCommodity = '', onExploreTrends }) {
  const [prices, setPrices] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [commodity, setCommodity] = useState(initialCommodity);
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [mandi, setMandi] = useState('');
  const [date, setDate] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  // Metadata
  const [commoditiesList, setCommoditiesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [mandisList, setMandisList] = useState([]);

  // Selected Modal
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Popular crop shortcuts
  const popularCrops = ['All', 'Wheat', 'Onion', 'Potato', 'Tomato', 'Cotton', 'Soyabean', 'Mustard', 'Paddy (Dhan)'];

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [cList, sList] = await Promise.all([
          api.getCommodities().catch(() => []),
          api.getStates().catch(() => []),
        ]);
        setCommoditiesList(cList);
        setStatesList(sList);
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    };
    loadMetadata();
  }, []);

  useEffect(() => {
    if (!state) {
      setDistrictsList([]);
      setDistrict('');
      return;
    }
    api.getDistricts(state).then(setDistrictsList).catch(() => setDistrictsList([]));
    setDistrict('');
    setMandi('');
  }, [state]);

  useEffect(() => {
    api.getMandis(state, district).then(setMandisList).catch(() => setMandisList([]));
  }, [state, district]);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPrices({
        search: search || undefined,
        commodity: commodity || undefined,
        state: state || undefined,
        district: district || undefined,
        mandi: mandi || undefined,
        date: date || undefined,
        sort_by: sortBy,
        page,
        limit,
      });
      setPrices(res.results || []);
      setTotalCount(res.count || 0);
      setTotalPages(res.total_pages || 1);
      if (res.results && res.results.length > 0) {
        try {
          localStorage.setItem('cached_cloud_mandi_prices', JSON.stringify(res));
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load prices, checking offline cache', err);
      const cached = localStorage.getItem('cached_cloud_mandi_prices');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setPrices(parsed.results || []);
          setTotalCount(parsed.count || 0);
          setTotalPages(parsed.total_pages || 1);
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }, [search, commodity, state, district, mandi, date, sortBy, page, limit]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  const clearAllFilters = () => {
    setSearch('');
    setCommodity('');
    setState('');
    setDistrict('');
    setMandi('');
    setDate('');
    setSortBy('date_desc');
    setPage(1);
  };

  const exportToCSV = () => {
    if (!prices.length) return;
    const headers = ['Crop,Variety,Mandi,District,State,Min_Price_INR,Max_Price_INR,Modal_Price_INR,Arrival_Date'];
    const rows = prices.map((p) =>
      `"${p.commodity}","${p.variety}","${p.mandi}","${p.district}","${p.state}",${p.minimum_price},${p.maximum_price},${p.modal_price},"${p.date}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mandi_rates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = search || commodity || state || district || mandi || date || sortBy !== 'date_desc';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Daily Mandi Rate Explorer (दैनिक मंडी भाव)
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 mt-1">
            Check Crop Prices in Mandis
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            All prices in ₹ per Quintal (प्रति क्विंटल / 100 kg) • Official APMC Market Records
          </p>
        </div>

        <div className="flex items-center space-x-3 no-print">
          {prices.length > 0 && (
            <>
              <button
                onClick={exportToCSV}
                className="apple-btn-secondary px-3.5 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 shadow-sm"
                title="Download rates as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                className="apple-btn-secondary px-3.5 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 shadow-sm"
                title="Print rate sheet or save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </>
          )}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="sm:hidden px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium flex items-center space-x-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 1-Tap Crop Quick Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-print">
        <span className="text-neutral-400 font-medium whitespace-nowrap">Quick Select Crop:</span>
        {popularCrops.map((c) => {
          const isSelected = c === 'All' ? !commodity : commodity === c;
          return (
            <button
              key={c}
              onClick={() => {
                setCommodity(c === 'All' ? '' : c);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Main Filter Bar */}
      <div className="apple-glass-card rounded-2xl p-5 space-y-4 no-print">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Type your crop name, mandi, or district (e.g. Wheat, Bisauli, Nashik)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F7F7] border border-neutral-200/80 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 ${mobileFilterOpen ? 'block' : 'hidden sm:grid'}`}>
          {/* Crop */}
          <div>
            <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Crop (फसल)
            </label>
            <select
              value={commodity}
              onChange={(e) => {
                setCommodity(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg bg-[#F7F7F7] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-black"
            >
              <option value="">All Crops</option>
              {commoditiesList.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              State (राज्य)
            </label>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg bg-[#F7F7F7] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-black"
            >
              <option value="">All States</option>
              {statesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              District (जिला)
            </label>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setPage(1);
              }}
              disabled={!state}
              className="w-full px-2.5 py-2 rounded-lg bg-[#F7F7F7] border border-neutral-200 text-xs text-neutral-900 disabled:opacity-50 focus:outline-none focus:border-black"
            >
              <option value="">All Districts</option>
              {districtsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Mandi */}
          <div>
            <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Mandi (मंडी)
            </label>
            <select
              value={mandi}
              onChange={(e) => {
                setMandi(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg bg-[#F7F7F7] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-black"
            >
              <option value="">All Mandis</option>
              {mandisList.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Date (तारीख)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 rounded-lg bg-[#F7F7F7] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-2 rounded-lg bg-[#F7F7F7] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-black"
            >
              <option value="date_desc">Latest Date First</option>
              <option value="price_desc">Highest Price First</option>
              <option value="price_asc">Lowest Price First</option>
            </select>
          </div>
        </div>

        {/* Clear Filter Prompt */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
            <span className="text-neutral-500 text-[11px]">
              Showing {totalCount.toLocaleString()} matching records
            </span>
            <button
              onClick={clearAllFilters}
              className="text-neutral-900 hover:text-black font-medium text-[11px] underline underline-offset-2"
            >
              Reset / Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="apple-glass-card rounded-2xl overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="flex items-center space-x-2 text-xs font-mono text-neutral-600 bg-white px-4 py-2 rounded-full shadow border border-neutral-200">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Checking latest mandi rates...</span>
            </div>
          </div>
        )}

        {/* Print-Only Official Rate Sheet Header */}
        <div className="print-only p-4 border-b border-neutral-300">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Cloud Mandi — Daily APMC Market Rate Sheet</h1>
              <p className="text-xs text-neutral-600 mt-1">
                Printed on: {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {commodity ? ` • Crop: ${commodity}` : ''}
                {state ? ` • State: ${state}` : ''}
                {district ? ` • District: ${district}` : ''}
              </p>
            </div>
            <div className="text-right text-xs text-neutral-600">
              <p className="font-semibold">Official APMC Mandi Records</p>
              <p>Rates in ₹ per Quintal (100 kg)</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] border-b border-neutral-200/80 text-neutral-500 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Crop Name (फसल)</th>
                <th className="py-3.5 px-6">Variety (किस्म)</th>
                <th className="py-3.5 px-6">Mandi / Market</th>
                <th className="py-3.5 px-6">District & State</th>
                <th className="py-3.5 px-6 text-right">Lowest Rate (न्यूनतम)</th>
                <th className="py-3.5 px-6 text-right">Highest Rate (अधिकतम)</th>
                <th className="py-3.5 px-6 text-right">Today's Rate (बाजार भाव)</th>
                <th className="py-3.5 px-6 text-right">Report Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {prices.length > 0 ? (
                prices.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedPrice(row)}
                    className="hover:bg-neutral-50/90 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-6 font-semibold text-neutral-950">
                      {row.commodity}
                    </td>
                    <td className="py-3.5 px-6 text-neutral-500">{row.variety}</td>
                    <td className="py-3.5 px-6 font-medium text-neutral-900">{row.mandi}</td>
                    <td className="py-3.5 px-6 text-neutral-500">
                      {row.district}, {row.state}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-neutral-600">
                      ₹{row.minimum_price?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-neutral-600">
                      ₹{row.maximum_price?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-6 text-right font-bold font-mono text-black text-sm">
                      ₹{row.modal_price?.toLocaleString()}{' '}
                      <span className="text-[10px] font-normal text-neutral-500">/ क्विंटल</span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-neutral-400">
                      {row.date}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center space-y-2">
                    <div className="text-neutral-400 text-xs">
                      No mandi rates found matching your search.
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="apple-btn-secondary px-4 py-1.5 rounded-full text-xs font-medium"
                      >
                        Clear Filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-[#FAFAFA] text-xs no-print">
          <div className="text-neutral-500 font-mono text-[11px]">
            Page {page} of {totalPages} ({totalCount} total records)
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-neutral-200/80 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-neutral-200/80 bg-white text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Price Detail Modal */}
      {selectedPrice && (
        <PriceDetailModal
          price={selectedPrice}
          onClose={() => setSelectedPrice(null)}
          onExploreTrends={(comm) => {
            if (onExploreTrends) onExploreTrends(comm);
          }}
        />
      )}
    </div>
  );
}
