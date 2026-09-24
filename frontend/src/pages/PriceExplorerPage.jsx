import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, X, ChevronLeft, ChevronRight, Download, Printer, SlidersHorizontal, History, Star, Mic, MicOff } from 'lucide-react';
import { api } from '../services/api';
import PriceDetailModal from '../components/common/PriceDetailModal';
import { compareWithMSP } from '../utils/mspData';

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

  // Recent searches
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cm_recent_searches') || '[]');
    } catch {
      return [];
    }
  });

  const saveSearchTerm = (term) => {
    if (!term || term.trim().length < 2) return;
    const clean = term.trim();
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem('cm_recent_searches', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Favorites / Watchlist
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cm_favorite_crops') || '[]');
    } catch {
      return [];
    }
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const toggleFavorite = (cropName, e) => {
    if (e) e.stopPropagation();
    if (!cropName) return;
    setFavorites((prev) => {
      const exists = prev.includes(cropName);
      const updated = exists ? prev.filter((c) => c !== cropName) : [...prev, cropName];
      try {
        localStorage.setItem('cm_favorite_crops', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Voice Search (Speech Recognition)
  const [isListening, setIsListening] = useState(false);

  const handleVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser. Please use Chrome on Android or desktop.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const clean = transcript.replace(/[.?!]$/, '').trim();
          setSearch(clean);
          saveSearchTerm(clean);
          setPage(1);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error', err);
      setIsListening(false);
    }
  };

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
        <span className="text-neutral-400 font-medium whitespace-nowrap">Quick Select:</span>
        <button
          onClick={() => {
            setShowOnlyFavorites(!showOnlyFavorites);
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            showOnlyFavorites
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100'
          }`}
          title="Filter only your starred watchlist crops"
        >
          <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-white text-white' : 'fill-amber-400 text-amber-500'}`} />
          <span>My Watchlist ({favorites.length})</span>
        </button>
        {popularCrops.map((c) => {
          const isSelected = !showOnlyFavorites && (c === 'All' ? !commodity : commodity === c);
          return (
            <button
              key={c}
              onClick={() => {
                setShowOnlyFavorites(false);
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
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveSearchTerm(search);
                }
              }}
              onBlur={() => {
                if (search && search.trim().length >= 2) {
                  saveSearchTerm(search);
                }
              }}
              placeholder="Type or speak crop, mandi, or district (e.g. Wheat, Bisauli, Nashik)..."
              className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-[#F7F7F7] border border-neutral-200/80 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="p-1 text-neutral-400 hover:text-black transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-1.5 rounded-lg transition-all ${
                  isListening
                    ? 'text-red-600 bg-red-100 animate-pulse shadow-sm shadow-red-200'
                    : 'text-neutral-500 hover:text-black hover:bg-neutral-200/60'
                }`}
                title={isListening ? 'Listening... Speak now' : 'Search by Voice / बोलकर खोजें'}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5 text-red-600" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          {isListening && (
            <div className="text-[11px] text-red-600 font-medium flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              <span>Listening... बोलिए (जैसे "गेहूं", "Sarson", "आजादपुर", "Nashik")</span>
            </div>
          )}

          {/* Recent Searches Chips */}
          {recentSearches.length > 0 && (
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5 text-[11px] text-neutral-500 pt-0.5">
              <span className="flex items-center space-x-1 text-neutral-400 font-medium">
                <History className="w-3 h-3" />
                <span>Recent:</span>
              </span>
              {recentSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSearch(item);
                    setPage(1);
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-[#EFEFEF] hover:bg-neutral-200 text-neutral-800 font-medium transition-colors"
                >
                  {item}
                </button>
              ))}
              <button
                onClick={() => {
                  setRecentSearches([]);
                  try {
                    localStorage.removeItem('cm_recent_searches');
                  } catch {}
                }}
                className="text-neutral-400 hover:text-neutral-700 text-[10px] ml-1 underline"
              >
                Clear
              </button>
            </div>
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
              {(() => {
                const displayedPrices = showOnlyFavorites
                  ? prices.filter((row) => favorites.includes(row.commodity))
                  : prices;

                if (displayedPrices.length === 0) {
                  return (
                    <tr>
                      <td colSpan={8} className="py-16 text-center space-y-2">
                        <div className="text-neutral-500 text-xs font-medium">
                          {showOnlyFavorites
                            ? "No crops in your Watchlist match the current view. Click the star ⭐ icon next to any crop to add it to your watchlist!"
                            : "No mandi rates found matching your search."}
                        </div>
                        {(hasActiveFilters || showOnlyFavorites) && (
                          <button
                            onClick={() => {
                              setShowOnlyFavorites(false);
                              clearAllFilters();
                            }}
                            className="apple-btn-secondary px-4 py-1.5 rounded-full text-xs font-medium"
                          >
                            Reset Filters
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }

                return displayedPrices.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedPrice(row)}
                    className="hover:bg-neutral-50/90 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-6 font-semibold text-neutral-950">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(row.commodity, e)}
                          className="text-neutral-300 hover:text-amber-500 transition-colors p-0.5 no-print"
                          title={favorites.includes(row.commodity) ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                          <Star className={`w-3.5 h-3.5 ${favorites.includes(row.commodity) ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
                        <span>{row.commodity}</span>
                      </div>
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
                    <td className="py-3.5 px-6 text-right font-mono">
                      <div className="font-bold text-black text-sm">
                        ₹{row.modal_price?.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-neutral-500">/ क्विंटल</span>
                      </div>
                      {(() => {
                        const msp = compareWithMSP(row.modal_price, row.commodity);
                        if (!msp) return null;
                        return (
                          <div className="mt-0.5">
                            <span
                              className={`inline-block text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                                msp.isAbove
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                              }`}
                              title={`Official MSP: ₹${msp.mspRate.toLocaleString('en-IN')}/Q`}
                            >
                              {msp.isAbove ? `+${msp.percent}% vs MSP` : `${msp.percent}% vs MSP`}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-neutral-400">
                      {row.date}
                    </td>
                  </tr>
                ));
              })()}
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
