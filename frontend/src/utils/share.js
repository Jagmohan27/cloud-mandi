import { compareWithMSP } from './mspData';

/**
 * Generates farmer-friendly formatted rate text for WhatsApp and SMS broadcast
 */
export function formatRateMessage(price) {
  if (!price) return '';
  const msp = compareWithMSP(price.modal_price, price.commodity);
  let mspLine = '';
  if (msp) {
    mspLine = `🏛️ *सरकारी समर्थन मूल्य (MSP)*: ₹${msp.mspRate.toLocaleString('en-IN')}/क्विंटल (${msp.isAbove ? `+${msp.percent}% ऊपर` : `${msp.percent}% नीचे`})\n`;
  }

  return `🌾 *क्लाउड मंडी — आज का बाजार भाव* 🌾\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📦 *फसल (Crop)*: ${price.commodity} (${price.variety || 'सामान्य'})\n` +
    `📍 *मंडी (Mandi)*: ${price.mandi}, ${price.district} (${price.state})\n` +
    `💰 *आज का भाव*: ₹${price.modal_price?.toLocaleString('en-IN')} / क्विंटल\n` +
    mspLine +
    `📊 *भाव दायरा*: ₹${price.minimum_price?.toLocaleString('en-IN')} - ₹${price.maximum_price?.toLocaleString('en-IN')}\n` +
    `📅 *तारीख*: ${price.date}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📲 सभी मंडियों के ताजा भाव चेक करें:\n` +
    `${typeof window !== 'undefined' ? window.location.origin : 'https://cloud-mandi.onrender.com'}`;
}

export function shareRate(price) {
  if (!price) return;
  const text = formatRateMessage(price);

  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({
      title: `${price.commodity} Rate - ${price.mandi} Mandi`,
      text: text,
      url: window.location.origin
    }).catch(() => {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });
  } else {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
}

export function copyRateMessage(price) {
  const text = formatRateMessage(price);
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error('Clipboard not supported'));
}
