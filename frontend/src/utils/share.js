export function shareRate(price) {
  if (!price) return;
  const text = `🌾 *Cloud Mandi - आज का मंडी भाव* 🌾\n` +
    `📦 *फसल*: ${price.commodity} (${price.variety || 'Normal'})\n` +
    `🏛️ *मंडी*: ${price.mandi} (${price.district}, ${price.state})\n` +
    `💰 *आज का भाव*: ₹${price.modal_price?.toLocaleString()} / क्विंटल (100 kg)\n` +
    `📉 न्यूनतम: ₹${price.minimum_price?.toLocaleString()} | 📈 अधिकतम: ₹${price.maximum_price?.toLocaleString()}\n` +
    `📅 रिपोर्ट तारीख: ${price.date}\n\n` +
    `📲 ताजा भाव देखें: ${window.location.origin}`;

  if (navigator.share) {
    navigator.share({
      title: `${price.commodity} Rate - ${price.mandi} Mandi`,
      text: text,
      url: window.location.origin
    }).catch(() => {
      // User canceled or fallback to WhatsApp
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });
  } else {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
}
