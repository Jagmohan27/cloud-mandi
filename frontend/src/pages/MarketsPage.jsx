import React, { useState, useEffect } from 'react';
import { Store, MapPin, Search, ChevronRight, Compass, Navigation } from 'lucide-react';
import { api } from '../services/api';
import { calculateDistanceKm, getMandiCoordinates } from '../utils/geoData';

export default function MarketsPage({ onSelectMandi }) {
  const [mandis, setMandis] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Geo-location state
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);

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

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      setLocationNotice({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }
    setLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        };
        setUserLocation(coords);
        setSortByDistance(true);
        setLocating(false);
        setLocationNotice({
          type: 'success',
          text: `Found your location (${coords.lat.toFixed(2)}°N, ${coords.lon.toFixed(2)}°E). Mandis sorted by nearest distance.`
        });
      },
      (err) => {
        setLocating(false);
        setLocationNotice({
          type: 'error',
          text: 'Unable to access location. You can select your state or search your district directly.'
        });
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const mandisWithDistance = mandis.map((m) => {
    let distance = null;
    if (userLocation) {
      const coords = getMandiCoordinates(m);
      if (coords) {
        distance = calculateDistanceKm(userLocation.lat, userLocation.lon, coords.lat, coords.lon);
      }
    }
    return { ...m, distance };
  });

  const filteredMandis = mandisWithDistance
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortByDistance) {
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
      }
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
            Agricultural Mandis & APMCs
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Government regulated market yards reporting wholesale daily prices
          </p>
        </div>

        {/* Mandis Near Me Button */}
        <button
          onClick={handleFindNearMe}
          disabled={locating}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 transition-all shadow-sm ${
            sortByDistance
              ? 'bg-emerald-700 text-white shadow-emerald-700/20'
              : 'apple-btn-secondary hover:border-neutral-400'
          }`}
          title="Find APMC Mandis closest to your current location"
        >
          <Compass className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Detecting Location...' : sortByDistance ? 'Near Me (Active)' : 'Find Mandis Near Me'}</span>
        </button>
      </div>

      {/* Geolocation Notice Banner */}
      {locationNotice && (
        <div
          className={`px-4 py-3 rounded-xl text-xs flex items-center justify-between border ${
            locationNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{locationNotice.text}</span>
          </div>
          <button
            onClick={() => setLocationNotice(null)}
            className="text-[11px] font-semibold underline underline-offset-2 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="apple-glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-2/3">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mandi, district, or state name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F7F7] border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-black"
          />
        </div>
        <div className="w-full sm:w-1/3">
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSortByDistance(false);
            }}
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
                  <div className="flex items-center space-x-1.5">
                    {m.distance !== null && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        📍 ~{m.distance} km
                      </span>
                    )}
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                      APMC Yard
                    </span>
                  </div>
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
