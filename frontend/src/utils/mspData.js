// Official Government of India Minimum Support Prices (MSP / न्यूनतम समर्थन मूल्य)
// Benchmark rates in ₹ per Quintal (100 kg)
export const MSP_BENCHMARKS = {
  'Wheat': { rate: 2275, season: 'Rabi 2024-25', hi: 'गेहूं' },
  'Paddy': { rate: 2183, season: 'Kharif 2024-25', hi: 'धान (सामान्य)' },
  'Paddy (Dhan)': { rate: 2183, season: 'Kharif 2024-25', hi: 'धान' },
  'Dhan': { rate: 2183, season: 'Kharif 2024-25', hi: 'धान' },
  'Mustard': { rate: 5650, season: 'Rabi 2024-25', hi: 'सरसों' },
  'Sarson': { rate: 5650, season: 'Rabi 2024-25', hi: 'सरसों' },
  'Gram': { rate: 5440, season: 'Rabi 2024-25', hi: 'चना' },
  'Chana': { rate: 5440, season: 'Rabi 2024-25', hi: 'चना' },
  'Soyabean': { rate: 4600, season: 'Kharif 2024-25', hi: 'सोयाबीन' },
  'Cotton': { rate: 6620, season: 'Kharif 2024-25', hi: 'कपास' },
  'Maize': { rate: 2090, season: 'Kharif 2024-25', hi: 'मक्का' },
  'Makka': { rate: 2090, season: 'Kharif 2024-25', hi: 'मक्का' },
  'Bajra': { rate: 2500, season: 'Kharif 2024-25', hi: 'बाजरा' },
  'Jowar': { rate: 3180, season: 'Kharif 2024-25', hi: 'ज्वार' },
  'Moong': { rate: 8558, season: 'Kharif 2024-25', hi: 'मूंग' },
  'Urad': { rate: 6950, season: 'Kharif 2024-25', hi: 'उड़द' },
  'Groundnut': { rate: 6377, season: 'Kharif 2024-25', hi: 'मूंगफली' },
  'Sunflower': { rate: 6760, season: 'Kharif 2024-25', hi: 'सूरजमुखी' },
  'Barley': { rate: 1850, season: 'Rabi 2024-25', hi: 'जौ' },
  'Masur': { rate: 6425, season: 'Rabi 2024-25', hi: 'मसूर' },
  'Lentil': { rate: 6425, season: 'Rabi 2024-25', hi: 'मसूर' },
  'Onion': { rate: 1950, season: 'Benchmark', hi: 'प्याज' },
  'Potato': { rate: 1200, season: 'Benchmark', hi: 'आलू' },
  'Tomato': { rate: 1500, season: 'Benchmark', hi: 'टमाटर' }
};

/**
 * Resolves MSP data for a given commodity name
 */
export function getMSP(cropName) {
  if (!cropName) return null;
  const name = cropName.trim().toLowerCase();
  for (const [key, val] of Object.entries(MSP_BENCHMARKS)) {
    if (name.includes(key.toLowerCase()) || key.toLowerCase().includes(name)) {
      return { commodity: key, ...val };
    }
  }
  return null;
}

/**
 * Compares current market price with the official MSP benchmark
 */
export function compareWithMSP(marketPrice, cropName) {
  const msp = getMSP(cropName);
  if (!msp || !marketPrice || Number(marketPrice) <= 0) return null;

  const current = Number(marketPrice);
  const diff = current - msp.rate;
  const percent = Math.round((diff / msp.rate) * 100);

  return {
    cropName: msp.commodity,
    mspRate: msp.rate,
    season: msp.season,
    diff,
    percent,
    isAbove: diff >= 0
  };
}
