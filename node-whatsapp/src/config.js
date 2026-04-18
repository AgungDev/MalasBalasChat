const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const parseNumberList = (value) => {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

module.exports = {
  app: {
    port: Number(process.env.APP_PORT || 3001),
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'malaschat_bot',
    url: process.env.DATABASE_URL || '',
  },
  openAI: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  },
  whatsapp: {
    sessionDir: process.env.WHATSAPP_SESSION_DIR || './node-whatsapp/session',
    allowedRoles: parseNumberList(process.env.ALLOWED_ROLES || ''),
    whitelistNumbers: parseNumberList(process.env.WHITELIST_NUMBERS || ''),
    maxReplyLength: Number(process.env.MAX_REPLY_LENGTH || 360),
    skipReplyRate: Number(process.env.SKIP_REPLY_RATE || 0),
    replyDelayMin: Number(process.env.REPLY_DELAY_MIN || 3000),
    replyDelayMax: Number(process.env.REPLY_DELAY_MAX || 15000),
  },
};
