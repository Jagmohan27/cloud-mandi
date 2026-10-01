// Comprehensive dictionary mapping regional/Hindi/Hinglish terms to AGMARKNET canonical commodities
export const CROP_SYNONYMS = {
  'Wheat': ['गेहूं', 'गेहुं', 'gehu', 'gehoon', 'kanak', 'gandham'],
  'Paddy (Dhan)': ['धान', 'चावल', 'dhan', 'chawal', 'paddy', 'basmati', 'shali', 'dhaan'],
  'Mustard': ['सरसों', 'सरसो', 'sarson', 'sarso', 'rai', 'toria', 'taramira'],
  'Potato': ['आलू', 'आलु', 'aloo', 'alu', 'batata'],
  'Onion': ['प्याज', 'प्याज़', 'pyaz', 'pyaaz', 'kanda', 'dungri', 'ullipayalu'],
  'Tomato': ['टमाटर', 'tamatar', 'tameta', 'thakkali'],
  'Cotton': ['कपास', 'रूई', 'kapas', 'kapaas', 'narma', 'cotton', 'rui'],
  'Soyabean': ['सोयाबीन', 'सोया', 'soyabean', 'soybean', 'soya'],
  'Gram': ['चना', 'छोले', 'chana', 'channa', 'chhole', 'gram', 'bengal gram'],
  'Maize': ['मक्का', 'मक्की', 'भुट्टा', 'makka', 'makki', 'bhutta', 'corn', 'maize'],
  'Bajra': ['बाजरा', 'बाजरो', 'bajra', 'bajri', 'pearl millet'],
  'Jowar': ['ज्वार', 'ज्वारी', 'jowar', 'jwari', 'sorghum'],
  'Moong': ['मूंग', 'मूंगदाल', 'moong', 'mung', 'green gram'],
  'Urad': ['उड़द', 'उड़द', 'urad', 'mash', 'black gram'],
  'Groundnut': ['मूंगफली', 'सिंगदाना', 'moongfali', 'mungfali', 'groundnut', 'peanut', 'singdana'],
  'Garlic': ['लहसुन', 'लहसून', 'lahsun', 'lasun', 'lehsun', 'vellulli'],
  'Ginger': ['अदरक', 'adrak', 'allam', 'inji'],
  'Chilli': ['मिर्च', 'हरी मिर्च', 'लाल मिर्च', 'mirch', 'mirchi', 'chilli', 'chili'],
  'Turmeric': ['हल्दी', 'haldi', 'turmeric', 'pasupu'],
  'Apple': ['सेब', 'seb', 'apple'],
  'Banana': ['केला', 'kela', 'banana', 'aratti'],
  'Mango': ['आम', 'aam', 'mango'],
  'Coriander': ['धनिया', 'dhaniya', 'kothmir', 'coriander'],
  'Cumin': ['जीरा', 'jeera', 'jira', 'cumin'],
  'Methi': ['मेथी', 'methi', 'fenugreek']
};

export const CROP_HINDI_NAMES = {
  'Wheat': 'गेहूं',
  'Paddy (Dhan)': 'धान',
  'Paddy': 'धान',
  'Mustard': 'सरसों',
  'Potato': 'आलू',
  'Onion': 'प्याज',
  'Tomato': 'टमाटर',
  'Cotton': 'कपास',
  'Soyabean': 'सोयाबीन',
  'Gram': 'चना',
  'Maize': 'मक्का',
  'Bajra': 'बाजरा',
  'Jowar': 'ज्वार',
  'Moong': 'मूंग',
  'Urad': 'उड़द',
  'Groundnut': 'मूंगफली',
  'Garlic': 'लहसुन',
  'Ginger': 'अदरक',
  'Chilli': 'मिर्च',
  'Turmeric': 'हल्दी',
  'Apple': 'सेब',
  'Banana': 'केला',
  'Mango': 'आम',
  'Coriander': 'धनिया',
  'Cumin': 'जीरा',
  'Methi': 'मेथी'
};

/**
 * Resolves regional Hindi or dialect text to standard AGMARKNET canonical crop name
 */
export function resolveCropSynonym(query) {
  if (!query) return query;
  const q = query.trim().toLowerCase();

  for (const [canonical, aliases] of Object.entries(CROP_SYNONYMS)) {
    if (canonical.toLowerCase() === q) return canonical;
    if (aliases.some(alias => alias.toLowerCase() === q || q === alias.toLowerCase())) {
      return canonical;
    }
  }

  // Also check if any alias is contained inside the query
  for (const [canonical, aliases] of Object.entries(CROP_SYNONYMS)) {
    for (const alias of aliases) {
      if (q.includes(alias.toLowerCase())) {
        return canonical;
      }
    }
  }

  return query;
}

/**
 * Gets Hindi name for a commodity
 */
export function getHindiCropName(name) {
  if (!name) return '';
  return CROP_HINDI_NAMES[name] || '';
}
