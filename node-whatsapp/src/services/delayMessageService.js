const { randomInRange } = require('../utils/random');

class DelayMessageService {
    // This service buffers incoming messages for a sender and flushes them together after a random delay. 
    // 5-15 seconds by default, configurable via environment variables. This helps to create more natural reply patterns and allows for combining multiple messages into one reply if they arrive in quick succession.
  constructor({ replyDelayMin = 5000, replyDelayMax = 15000 } = {}, onFlush) {
    if (typeof onFlush !== 'function') {
      throw new Error('DelayMessageService requires an onFlush callback function.');
    }

    this.replyDelayMin = Number(replyDelayMin);
    this.replyDelayMax = Number(replyDelayMax);
    this.onFlush = onFlush;
    this.buffers = new Map();
  }

  async enqueue(senderJid, messageText, metadata = {}) {
    if (!senderJid || !messageText) {
      return;
    }

    const entry = this.buffers.get(senderJid);
    if (entry) {
      entry.messages.push(messageText);
      entry.metadata = { ...entry.metadata, ...metadata };
      console.info('DelayMessageService: appending message to existing delay buffer', {
        senderJid,
        queuedMessages: entry.messages.length,
        textPreview: messageText.slice(0, 120),
      });
      return;
    }

    const delayMs = randomInRange(this.replyDelayMin, this.replyDelayMax);
    const messages = [messageText];
    const timer = setTimeout(() => this.flush(senderJid), delayMs);

    this.buffers.set(senderJid, {
      messages,
      metadata,
      timer,
      delayMs,
      createdAt: Date.now(),
    });

    console.info('DelayMessageService: buffering initial message for delayed reply', {
      senderJid,
      delayMs,
      textPreview: messageText.slice(0, 120),
    });
  }

  async flush(senderJid) {
    const entry = this.buffers.get(senderJid);
    if (!entry) {
      return;
    }

    clearTimeout(entry.timer);
    this.buffers.delete(senderJid);

    const combinedText = entry.messages.join('\n');
    console.info('DelayMessageService: flushing buffered messages', {
      senderJid,
      messageCount: entry.messages.length,
      delayMs: entry.delayMs,
      combinedPreview: combinedText.slice(0, 120),
    });

    try {
      await this.onFlush(senderJid, combinedText, entry.metadata);
    } catch (error) {
      console.error('DelayMessageService: error flushing delayed message', error);
    }
  }

  cancelAll() {
    for (const [senderJid, entry] of this.buffers.entries()) {
      clearTimeout(entry.timer);
      this.buffers.delete(senderJid);
    }
  }
}

module.exports = DelayMessageService;
