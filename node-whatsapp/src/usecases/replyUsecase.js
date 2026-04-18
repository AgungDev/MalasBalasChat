const {
  randomInRange,
  shouldSkipReply,
  truncateMessage,
  normalizePhone,
} = require('../utils/random');

class ReplyUsecase {
  constructor(repository, aiService, config) {
    this.repository = repository;
    this.aiService = aiService;
    this.config = config;
  }

  isAllowedContact(role, phone) {
    const allowedRoles = this.config.allowedRoles.map((item) => item.toLowerCase());
    if (allowedRoles.length === 0) {
      return true;
    }

    const normalizedRole = (role || '').toLowerCase();
    return (
      allowedRoles.includes(normalizedRole) ||
      this.config.whitelistNumbers.includes(phone)
    );
  }

  async createReply(remoteJid, messageText) {
    const phone = normalizePhone(remoteJid);
    console.info('ReplyUsecase: received incoming message', {
      remoteJid,
      phone,
      textPreview: messageText ? messageText.slice(0, 120) : null,
    });

    if (!phone || !messageText) {
      console.warn('ReplyUsecase: missing phone or message text, skipping reply', { remoteJid });
      return null;
    }

    const userPersona = await this.repository.getUserPersonaByPhone(phone);
    if (!userPersona) {
      console.warn('ReplyUsecase: user persona not found for phone', { phone });
      return null;
    }

    console.info('ReplyUsecase: found persona mapping', {
      userId: userPersona.user_id,
      phone: userPersona.phone,
      role: userPersona.role,
      personaId: userPersona.persona_id,
      personaName: userPersona.persona_name,
    });

    if (!this.isAllowedContact(userPersona.role, phone)) {
      console.warn('ReplyUsecase: contact not allowed to receive reply', {
        phone,
        role: userPersona.role,
        allowedRoles: this.config.allowedRoles,
      });
      return null;
    }

    if (shouldSkipReply(this.config.skipReplyRate)) {
      console.info('ReplyUsecase: skip reply triggered by skipReplyRate', {
        rate: this.config.skipReplyRate,
      });
      return null;
    }

    await this.applyRandomDelay();

    const reply = await this.aiService.generateReply(
      userPersona.system_prompt,
      messageText,
    );

    const finalReply = truncateMessage(reply, this.config.maxReplyLength);
    console.info('ReplyUsecase: generated reply', {
      replyPreview: finalReply.slice(0, 120),
      maxReplyLength: this.config.maxReplyLength,
    });

    return finalReply;
  }

  async applyRandomDelay() {
    const delay = randomInRange(
      this.config.replyDelayMin,
      this.config.replyDelayMax,
    );

    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

module.exports = ReplyUsecase;
