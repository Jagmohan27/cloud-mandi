import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import PriceExplorerPage from './pages/PriceExplorerPage';
import CompareMandisPage from './pages/CompareMandisPage';
import TrendsPage from './pages/TrendsPage';
import MarketsPage from './pages/MarketsPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedCommodity, setSelectedCommodity] = useState('Wheat');
  const [selectedMandi, setSelectedMandi] = useState('');

  const handleSelectCommodity = (comm) => {
    setSelectedCommodity(comm);
    setActiveTab('prices');
  };

  const handleExploreTrends = (comm) => {
    setSelectedCommodity(comm);
    setActiveTab('trends');
  };

  const handleSelectMandi = (mandiName) => {
    setSelectedMandi(mandiName);
    setActiveTab('prices');
  };

  const pageVariants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' } },
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-950 selection:text-white">
        {/* Clean Farmer Navigation */}
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Pages */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              {activeTab === 'landing' && (
                <LandingPage
                  setActiveTab={setActiveTab}
                  onSelectCommodity={handleSelectCommodity}
                />
              )}

              {activeTab === 'prices' && (
                <PriceExplorerPage
                  initialCommodity={selectedCommodity}
                  onExploreTrends={handleExploreTrends}
                />
              )}

              {activeTab === 'compare' && (
                <CompareMandisPage onSelectCommodity={handleSelectCommodity} />
              )}

              {activeTab === 'trends' && (
                <TrendsPage initialCommodity={selectedCommodity || 'Wheat'} />
              )}

              {activeTab === 'markets' && (
                <MarketsPage onSelectMandi={handleSelectMandi} />
              )}

              {activeTab === 'admin' && <AdminPage />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Minimal Footer */}
        <Footer setActiveTab={setActiveTab} />
      </div>
    </LanguageProvider>
  );
}
