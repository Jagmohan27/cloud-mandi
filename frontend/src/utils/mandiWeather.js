/**
 * Mandi Yard Weather Safety Advisory for Indian Farmers
 * Calculates open-air yard unloading conditions, rain caution, and tarpaulin alerts
 */

export function getMandiWeatherAdvisory(state = '', district = '') {
  const currentMonth = new Date().getMonth(); // 0 = Jan, 9 = Oct

  // Monsoon / Post-monsoon cyclone months: June to September, plus Oct/Nov for coastal states
  const isSouthMonsoon = ['Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Karnataka'].some(s =>
    state.toLowerCase().includes(s.toLowerCase())
  );
  const isCoastal = ['Odisha', 'West Bengal', 'Gujarat', 'Maharashtra'].some(s =>
    state.toLowerCase().includes(s.toLowerCase())
  );

  // Oct - Nov North-East monsoon for South India
  if (isSouthMonsoon && (currentMonth >= 9 && currentMonth <= 11)) {
    return {
      status: 'caution',
      badgeColor: 'amber',
      title: 'बारिश व नमी चेतावनी (Rain & Moisture Caution)',
      advice: 'उत्तर-पूर्वी मानसूनी बारिश संभव। अपनी उपज ढकने के लिए तिरपाल (Tarpaulin) अवश्य साथ रखें।',
      yardCondition: 'शेड में नीलामी प्राथमिकता (Covered Shed Preferred)',
      isSafeOpenYard: false,
    };
  }

  // Active South-West Monsoon (June to September)
  if (currentMonth >= 5 && currentMonth <= 8) {
    return {
      status: 'caution',
      badgeColor: 'amber',
      title: 'मानसूनी मौसम (Monsoon Advisory)',
      advice: 'मंडी प्रांगण में जलभराव या बारिश का जोखिम। सूखा स्थान देखकर ही उपज का ढेर लगाएं।',
      yardCondition: 'तिरपाल जरूरी (Tarpaulin Mandatory)',
      isSafeOpenYard: false,
    };
  }

  // Winter Fog / Morning Dew (December to February)
  if (currentMonth === 11 || currentMonth <= 1) {
    return {
      status: 'safe',
      badgeColor: 'blue',
      title: 'शीतकालीन मौसम (Winter Clear / Morning Dew)',
      advice: 'सुबह के समय ओस/नमी से नमी का प्रतिशत बढ़ सकता है। धूप निकलने पर ही तौल करवाएं।',
      yardCondition: 'खुला प्रांगण अनुकूल (Open Yard Favorable)',
      isSafeOpenYard: true,
    };
  }

  // Sunny Harvest / Summer Season (March to May & October)
  return {
    status: 'safe',
    badgeColor: 'emerald',
    title: 'मौसम साफ व अनुकूल (Clear Weather)',
    advice: 'मंडी में खुले प्रांगण में उपज उतारना पूरी तरह सुरक्षित है। शुष्क मौसम व सुगम तौल।',
    yardCondition: 'खुली नीलामी सुरक्षित (Safe Open Auction)',
    isSafeOpenYard: true,
  };
}
