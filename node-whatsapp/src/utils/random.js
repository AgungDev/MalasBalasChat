function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shouldSkipReply(skipRatio) {
  return Math.random() < skipRatio;
}

function normalizePhone(jid) {
  if (!jid || typeof jid !== 'string') return null;
  const [number] = jid.split('@');
  if (!number) return null;
  return number.replace(/[^0-9]/g, '');
}

function buildWhatsAppJid(jidOrPhone) {
  if (!jidOrPhone || typeof jidOrPhone !== 'string') return null;
  if (jidOrPhone.includes('@')) return jidOrPhone;

  const normalized = normalizePhone(jidOrPhone);
  return normalized ? `${normalized}@s.whatsapp.net` : null;
}

function truncateMessage(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim();
}

module.exports = {
  randomInRange,
  shouldSkipReply,
  normalizePhone,
  buildWhatsAppJid,
  truncateMessage,
};
