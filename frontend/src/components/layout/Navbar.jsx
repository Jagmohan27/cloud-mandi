import React, { useState } from 'react';
import { Sprout, Menu, X, Search, Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, toggleLanguage, t } = useLanguage();

  const navItems = [
    { id: 'landing', label: t('navHome') },
    { id: 'prices', label: t('navRates') },
    { id: 'compare', label: t('navCompare') },
    { id: 'trends', label: t('navTrends') },
    { id: 'markets', label: t('navMarkets') },
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
              {t('brandSubtitle')}
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
                className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
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

        {/* Right Actions: Language Switcher & Quick Rate Search */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-medium text-neutral-800 transition-colors flex items-center space-x-1.5"
            title="Switch Language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-neutral-600" />
            <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          <button
            onClick={() => setActiveTab('prices')}
            className="apple-btn-primary px-4 py-2 rounded-full text-xs font-medium flex items-center space-x-1.5 shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t('btnCheckRates')}</span>
          </button>
        </div>

        {/* Mobile menu toggle & quick lang */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-800"
          >
            {lang === 'en' ? 'हिन्दी' : 'EN'}
          </button>
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
