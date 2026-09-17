import React from 'react';
import { Sprout } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="w-full bg-[#FAFAFA] border-t border-neutral-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center text-white text-xs font-semibold">
                <Sprout className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight text-neutral-950">
                Cloud Mandi (क्लाउड मंडी)
              </span>
            </div>
            <p className="text-xs text-neutral-500 max-w-md leading-relaxed">
              Dedicated to transparency in Indian agriculture. Empowering farmers and traders with daily wholesale market rates across registered APMC mandis.
            </p>
            <div className="text-[11px] text-neutral-400">
              Data Source: Ministry of Agriculture & Farmers Welfare (data.gov.in / AGMARKNET)
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li>
                <button onClick={() => setActiveTab('prices')} className="hover:text-black transition-colors">
                  Today's Mandi Rates (आज का भाव)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('compare')} className="hover:text-black transition-colors">
                  Compare Mandis (भाव तुलना)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('trends')} className="hover:text-black transition-colors">
                  Price Trends (भाव ऊपर या नीचे?)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('markets')} className="hover:text-black transition-colors">
                  Registered Mandis Directory
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with discreet admin link */}
        <div className="pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-2">
          <p>© {new Date().getFullYear()} Cloud Mandi. All prices displayed in ₹ per Quintal (100 kg).</p>
          <div className="flex items-center space-x-3">
            <span>Verified APMC Data</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('admin')}
              className="text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              Data Sync Control
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
