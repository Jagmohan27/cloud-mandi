import React, { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Tag, TrendingUp, ArrowRight, ShieldCheck, Share2 } from 'lucide-react';
import { api } from '../../services/api';
import { shareRate } from '../../utils/share';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function PriceDetailModal({ price, onClose, onExploreTrends }) {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
              <span>{price.commodity}</span>
              <span>•</span>
              <span>Variety: {price.variety}</span>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">
              {price.mandi} Mandi (मंडी)
            </h2>
            <div className="flex items-center space-x-1.5 text-xs text-neutral-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>{price.district}, {price.state}</span>
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

        {/* Footer */}
        <div className="p-4 bg-[#F7F7F7] border-t border-neutral-100 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500">
            Source: Official APMC Market Record
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => shareRate(price)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center space-x-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Share on WhatsApp</span>
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
