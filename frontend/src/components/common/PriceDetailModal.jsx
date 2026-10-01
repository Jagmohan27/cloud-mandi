import React, { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Tag, TrendingUp, ArrowRight, ShieldCheck, Share2, Award, Copy, Check, Navigation, FileText, Printer } from 'lucide-react';
import { api } from '../../services/api';
import { shareRate, copyRateMessage } from '../../utils/share';
import { compareWithMSP } from '../../utils/mspData';
import { getHindiCropName } from '../../utils/cropSynonyms';
import { getMandiWeatherAdvisory } from '../../utils/mandiWeather';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function PriceDetailModal({ price, onClose, onExploreTrends }) {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showParchi, setShowParchi] = useState(false);
  const [farmerName, setFarmerName] = useState('किसान भाई / Farmer');
  const [parchiWeight, setParchiWeight] = useState(25);
  const [slipNumber] = useState(() => 'MP-' + Math.floor(100000 + Math.random() * 900000));

  const handleCopy = async () => {
    try {
      await copyRateMessage(price);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  useEffect(() => {
    if (!price?.commodity) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const data = await api.getPriceHistory(price.commodity, {
          mandi: price.mandi,
          days: 30,
        });
        setHistory(data.history || []);
      } catch (err) {
        console.error('Failed to load modal history', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [price]);

  if (!price) return null;

  const mspComp = compareWithMSP(price.modal_price, price.commodity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-100">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              <Tag className="w-3.5 h-3.5" />
              <span>
                {price.commodity} {getHindiCropName(price.commodity) ? `(${getHindiCropName(price.commodity)})` : ''}
              </span>
              <span>•</span>
              <span>Variety: {price.variety}</span>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">
              {price.mandi} Mandi (मंडी)
            </h2>
            <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-500 mt-1">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>{price.district}, {price.state}</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${price.mandi} Mandi, ${price.district}, ${price.state}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors"
                title="Open in Google Maps for driving directions"
              >
                <Navigation className="w-3 h-3" />
                <span>रास्ता देखें (Directions)</span>
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {showParchi ? (
          <div className="p-6 space-y-4">
            {/* Parchi Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs no-print">
              <div className="flex items-center space-x-2">
                <label className="font-semibold text-neutral-700">किसान (Farmer):</label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="px-2 py-1 rounded border border-neutral-300 bg-white text-xs font-medium text-neutral-900 focus:outline-none focus:border-black"
                  placeholder="Farmer Name"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="font-semibold text-neutral-700">वजन (Quintal):</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={parchiWeight}
                  onChange={(e) => setParchiWeight(Math.max(1, Number(e.target.value)))}
                  className="w-16 px-2 py-1 rounded border border-neutral-300 bg-white text-xs text-center font-bold font-mono focus:outline-none focus:border-black"
                />
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-black text-white rounded-lg font-medium flex items-center space-x-1 hover:bg-neutral-800 transition-colors shadow-sm ml-2"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>प्रिंट (Print)</span>
                </button>
              </div>
            </div>

            {/* Authentic Mandi Parchi Slip */}
            <div className="border-2 border-neutral-900 rounded-2xl p-5 bg-[#FCFBF7] text-neutral-900 space-y-4 shadow-sm print:border-black print:m-0 print:p-4">
              {/* Parchi Header */}
              <div className="text-center pb-3 border-b-2 border-dashed border-neutral-400">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                  कृषि उपज मंडी समिति (APMC Market Committee)
                </div>
                <h3 className="text-lg font-black tracking-tight text-neutral-950 mt-0.5">
                  {price.mandi} मंडी, {price.district} ({price.state})
                </h3>
                <p className="text-[11px] text-neutral-600">
                  दैनिक आवक व आधिकारिक दर पर्ची (Daily Mandi Rate Slip)
                </p>
                <div className="flex justify-between items-center text-[11px] font-mono text-neutral-600 mt-2 pt-2 border-t border-neutral-200">
                  <span>पर्ची सं.: <strong>{slipNumber}</strong></span>
                  <span>दिनांक: <strong>{price.date}</strong></span>
                </div>
              </div>

              {/* Lot Particulars Table */}
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-neutral-200">
                  <tr>
                    <td className="py-2 text-neutral-600 font-medium">किसान / विक्रेता:</td>
                    <td className="py-2 font-bold text-neutral-900 text-right">{farmerName}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-neutral-600 font-medium">फसल का नाम (Crop):</td>
                    <td className="py-2 font-bold text-neutral-900 text-right">
                      {price.commodity} {getHindiCropName(price.commodity) ? `(${getHindiCropName(price.commodity)})` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-neutral-600 font-medium">किस्म / ग्रेड (Variety/Grade):</td>
                    <td className="py-2 text-neutral-800 text-right">{price.variety} / {price.grade || 'FAQ'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-neutral-600 font-medium">तय दर (Agreed Rate):</td>
                    <td className="py-2 font-mono font-bold text-neutral-900 text-right">
                      ₹{price.modal_price?.toLocaleString('en-IN')} / क्विंटल
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-neutral-600 font-medium">कुल तौल (Total Weight):</td>
                    <td className="py-2 font-mono font-bold text-neutral-900 text-right">
                      {parchiWeight} क्विंटल ({(parchiWeight * 100).toLocaleString('en-IN')} kg)
                    </td>
                  </tr>
                  <tr className="bg-neutral-100/90 font-bold">
                    <td className="py-2 px-2 text-neutral-950 font-bold">कुल देय राशि (Gross Amount):</td>
                    <td className="py-2 px-2 text-right font-mono text-emerald-950 text-base">
                      ₹{Math.round(price.modal_price * parchiWeight).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signature Lines */}
              <div className="pt-4 grid grid-cols-2 gap-4 text-center text-[10px] text-neutral-600 border-t border-dashed border-neutral-300">
                <div>
                  <div className="h-8 border-b border-neutral-400"></div>
                  <span className="mt-1 block font-medium">किसान के हस्ताक्षर (Farmer)</span>
                </div>
                <div>
                  <div className="h-8 border-b border-neutral-400"></div>
                  <span className="mt-1 block font-medium">तौल लिपिक / व्यापारी (Clerk)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Rate Trio */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F7F7F7] border border-neutral-200/80 text-center">
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Lowest Rate (न्यूनतम)
                </div>
                <div className="text-lg font-semibold text-neutral-800 mt-0.5 font-mono">
                  ₹{price.minimum_price?.toLocaleString()}
                </div>
                <div className="text-[10px] text-neutral-400">प्रति क्विंटल</div>
              </div>
              <div className="border-x border-neutral-200">
                <div className="text-[11px] font-semibold text-neutral-950 uppercase tracking-wider">
                  Today's Rate (बाजार भाव)
                </div>
                <div className="text-2xl font-bold text-black mt-0.5 font-mono">
                  ₹{price.modal_price?.toLocaleString()}
                </div>
                <div className="text-[10px] text-neutral-600 font-medium">प्रति 100 kg</div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Highest Rate (अधिकतम)
                </div>
                <div className="text-lg font-semibold text-neutral-800 mt-0.5 font-mono">
                  ₹{price.maximum_price?.toLocaleString()}
                </div>
                <div className="text-[10px] text-neutral-400">प्रति क्विंटल</div>
              </div>
            </div>

            {/* MSP Benchmark Comparison */}
            {mspComp && (
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                  mspComp.isAbove
                    ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                    : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                      mspComp.isAbove
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                    }`}
                  >
                    MSP
                  </div>
                  <div>
                    <div className="font-semibold flex items-center space-x-2">
                      <span>Govt MSP Benchmark: ₹{mspComp.mspRate.toLocaleString('en-IN')}/Q</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          mspComp.isAbove
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {mspComp.isAbove
                          ? `+${mspComp.percent}% Above MSP`
                          : `${mspComp.percent}% Below MSP`}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      {mspComp.isAbove
                        ? `Mandi rate is ₹${mspComp.diff.toLocaleString('en-IN')}/Q higher than GOI minimum support price.`
                        : `Mandi rate is ₹${Math.abs(mspComp.diff).toLocaleString('en-IN')}/Q below GOI minimum support price.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mandi Yard Weather & Rain Safety Advisory */}
            {(() => {
              const weather = getMandiWeatherAdvisory(price.state, price.district);
              return (
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                    weather.isSafeOpenYard
                      ? 'bg-sky-50/70 border-sky-200/80 text-sky-950'
                      : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${
                        weather.isSafeOpenYard
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-amber-600 text-white shadow-sm'
                      }`}
                    >
                      {weather.isSafeOpenYard ? '☀️' : '🌧️'}
                    </div>
                    <div>
                      <div className="font-semibold flex items-center space-x-2">
                        <span>मंडी मौसम सुरक्षा (Yard Weather Advisory): {weather.title}</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        {weather.advice} • <strong>{weather.yardCondition}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 30-Day Trendline */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>30-Day Price Movement in this Mandi</span>
                </span>
              </div>
              <div className="h-36 w-full rounded-2xl bg-[#FAFAFA] border border-neutral-100 p-2 flex items-center justify-center">
                {loadingHistory ? (
                  <div className="text-xs text-neutral-400">Loading trend...</div>
                ) : history.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="modalGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#000000" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['dataMin - 50', 'dataMax + 50']} hide />
                      <Tooltip
                        formatter={(val) => [`₹${val} /Q`, "Today's Rate"]}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{
                          backgroundColor: '#000',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px',
                          border: 'none',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="modal_price"
                        stroke="#000000"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#modalGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-neutral-400">No previous records for this mandi</div>
                )}
              </div>
            </div>

            {/* Details Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center space-x-2 text-neutral-600">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span>Report Date: <strong className="text-neutral-900 font-mono">{price.date}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-600">
                <ShieldCheck className="w-4 h-4 text-neutral-400" />
                <span>Grade: <strong className="text-neutral-900">{price.grade || 'Standard / FAQ'}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-[#F7F7F7] border-t border-neutral-100 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowParchi(!showParchi)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                showParchi
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-800'
              }`}
              title="Toggle printable Mandi Parchi slip"
            >
              <FileText className={`w-3.5 h-3.5 ${showParchi ? 'text-white' : 'text-amber-600'}`} />
              <span>{showParchi ? 'विवरण (Details)' : 'मंडी पर्ची (Slip)'}</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 transition-colors flex items-center space-x-1.5"
              title="Copy formatted rate message to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              onClick={() => shareRate(price)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center space-x-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => {
                onClose();
                if (onExploreTrends) onExploreTrends(price.commodity);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-black hover:bg-neutral-200 transition-colors flex items-center space-x-1"
            >
              <span>Full Price Trend</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-black text-white hover:bg-neutral-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
