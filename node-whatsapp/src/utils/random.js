function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shouldSkipReply(skipRatio) {
  return Math.random() < skipRatio;
}

function normalizePhone(jid) {
  if (!jid || typeof jid !== 'string') return null;
  const [user] = jid.split('@')[0].split(':');
  if (!user) return null;
  return user.replace(/[^0-9]/g, '');
}

function normalizeJid(jid) {
  if (!jid || typeof jid !== 'string') return null;
  const cleaned = jid.trim().toLowerCase();
  if (!cleaned.includes('@')) return null;
  const [user, domain] = cleaned.split('@');
  const [normalizedUser] = user.split(':');
  return `${normalizedUser}@${domain}`;
}

function buildWhatsAppJid(jidOrPhone) {
  if (!jidOrPhone || typeof jidOrPhone !== 'string') return null;
  if (jidOrPhone.includes('@')) return normalizeJid(jidOrPhone);

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
  normalizeJid,
  buildWhatsAppJid,
  truncateMessage,
};
