const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode-terminal');

function extractTextFromMessage(message) {
  if (!message) return null;
  if (message.conversation) return message.conversation;
  if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
  if (message.imageMessage?.caption) return message.imageMessage.caption;
  return null;
}

class WhatsAppClient {
  constructor({ sessionDir, onMessage }) {
    this.sessionDir = sessionDir;
    this.onMessage = onMessage;
    this.socket = null;
  }

  async start() {
    const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    this.socket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['malasbalas-bot', 'Chrome', '1.0.0'],
    });

    this.socket.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        QRCode.generate(qr, { small: true });
        console.info('WhatsApp QR code generated. Scan with your phone.');
      }

      if (connection === 'open') {
        console.info('WhatsApp connection opened.');
      }

      if (connection === 'close') {
        const status = lastDisconnect?.error?.output?.statusCode;
        console.warn('WhatsApp disconnected:', status || lastDisconnect?.error);
        if (status !== DisconnectReason.loggedOut) {
          console.info('Attempting WhatsApp reconnect...');
          setTimeout(() => this.start().catch((err) => console.error('Reconnect failed', err)), 3000);
        } else {
          console.error('WhatsApp session logged out. Remove session files and restart.');
        }
      }
    });

    this.socket.ev.on('creds.update', saveCreds);
    this.socket.ev.on('messages.upsert', async (update) => {
      if (update.type !== 'notify') return;
      for (const message of update.messages) {
        if (!message.message || message.key?.fromMe) continue;

        const text = extractTextFromMessage(message.message);
        if (!text) continue;

        if (!message.key.remoteJid) continue;

        console.info('WhatsAppClient: received inbound message', {
          remoteJid: message.key.remoteJid,
          messageId: message.key.id,
          textPreview: text.slice(0, 120),
        });

        const payload = {
          remoteJid: message.key.remoteJid,
          sender: message.key.remoteJid,
          text,
          messageId: message.key.id,
        };

        try {
          await this.onMessage(payload);
        } catch (error) {
          console.error('WhatsAppClient: failed to process message', error);
        }
      }
    });
  }

  async sendText(remoteJid, text) {
    if (!this.socket) {
      throw new Error('WhatsApp socket is not initialized.');
    }

    console.info('WhatsAppClient: sending message', {
      remoteJid,
      textPreview: text ? text.slice(0, 120) : null,
    });

    const result = await this.socket.sendMessage(remoteJid, {
      text,
    });

    console.info('WhatsAppClient: message send result', {
      remoteJid,
      status: result ? 'sent' : 'unknown',
    });

    return result;
  }
}

module.exports = WhatsAppClient;
