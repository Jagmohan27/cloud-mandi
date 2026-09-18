import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    brandSubtitle: 'Daily Agricultural Mandi Rates (₹ / Quintal)',
    navHome: 'Home',
    navRates: "Today's Mandi Rates",
    navCompare: 'Compare Mandis',
    navTrends: 'Price Trends',
    navMarkets: 'Market Directory',
    btnCheckRates: 'Check Crop Rates',
    heroTag: 'Official Government APMC Market Rates (AGMARKNET)',
    heroTitle1: "Today's Mandi Prices,",
    heroTitle2: 'delivered simply.',
    heroSubtitle: 'Check daily wholesale crop prices across Indian mandis before taking your harvest to market. Always know the best rate.',
    popularCrops: 'Popular Crops',
    allCrops: 'All Crops',
    modalRate: "Today's Rate (Modal)",
    minRate: 'Lowest Rate',
    maxRate: 'Highest Rate',
    perQuintal: 'per Quintal (100 kg)',
    highestPriceMandi: 'Highest Price Mandi',
    downloadCsv: 'Download Rates (CSV)',
    searchPlaceholder: 'Search crop, mandi, district or state...',
    rateMovementTitle: 'Is Your Crop Price Rising or Falling?',
    selectCrop: 'Select Crop',
    selectState: 'Select State',
    allStates: 'All Indian States',
    allMandis: 'All Mandis',
    past7Days: 'Past 7 Days',
    past30Days: 'Past 30 Days',
    past90Days: 'Past 3 Months',
    past1Year: 'Past 1 Year',
  },
  hi: {
    brandSubtitle: 'दैनिक कृषि मंडी भाव (₹ / क्विंटल)',
    navHome: 'होम',
    navRates: 'आज का मंडी भाव',
    navCompare: 'भाव तुलना',
    navTrends: 'भाव ट्रेंड',
    navMarkets: 'मंडी डायरेक्टरी',
    btnCheckRates: 'मंडी भाव देखें',
    heroTag: 'भारत सरकार आधिकारिक APMC मंडी दरें (AGMARKNET)',
    heroTitle1: 'आज का सटीक मंडी भाव,',
    heroTitle2: 'सीधे आपके मोबाइल पर।',
    heroSubtitle: 'मंडी जाने से पहले अपनी फसल का आज का ताजा थोक भाव जांचें। हमेशा सबसे अच्छा दाम पाएं।',
    popularCrops: 'प्रमुख फसलें',
    allCrops: 'सभी फसलें',
    modalRate: 'आज का बाजार भाव',
    minRate: 'न्यूनतम भाव',
    maxRate: 'अधिकतम भाव',
    perQuintal: 'प्रति क्विंटल (100 kg)',
    highestPriceMandi: 'सर्वश्रेष्ठ भाव वाली मंडी',
    downloadCsv: 'भाव सूची डाउनलोड (CSV)',
    searchPlaceholder: 'फसल, मंडी, जिला या राज्य खोजें...',
    rateMovementTitle: 'आपकी फसल का भाव बढ़ रहा है या घट रहा है?',
    selectCrop: 'फसल चुनें',
    selectState: 'राज्य चुनें',
    allStates: 'सभी राज्य',
    allMandis: 'सभी मंडियां',
    past7Days: 'पिछले 7 दिन',
    past30Days: 'पिछले 30 दिन',
    past90Days: 'पिछले 3 महीने',
    past1Year: 'पिछला 1 साल',
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('cloud_mandi_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('cloud_mandi_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
