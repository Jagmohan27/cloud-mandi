import React, { useState } from 'react';
import { Sprout, Menu, X, ArrowDownUp, TrendingUp, Store, Search } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'prices', label: "Today's Mandi Rates" },
    { id: 'compare', label: 'Compare Mandis' },
    { id: 'trends', label: 'Price Trends' },
    { id: 'markets', label: 'Market Directory' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full apple-glass border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Farmer-friendly Brand */}
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-3 group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-105 shadow-sm">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base font-semibold tracking-tight text-neutral-950 leading-none">
              Cloud Mandi
            </span>
            <span className="text-[11px] text-neutral-500 font-medium mt-0.5">
              Daily Agricultural Mandi Rates (प्रति क्विंटल)
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Quick Rate Search Action */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('prices')}
            className="apple-btn-primary px-4 py-2 rounded-full text-xs font-medium flex items-center space-x-1.5 shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Check Crop Rates</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-white border-b border-neutral-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-neutral-950 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
