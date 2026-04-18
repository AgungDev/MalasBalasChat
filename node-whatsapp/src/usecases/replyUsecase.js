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

  async createReply(senderJid, messageText, { senderPn } = {}) {
    const phone = normalizePhone(senderJid);
    console.info('ReplyUsecase: received incoming message', {
      senderJid,
      senderPn,
      phone,
      textPreview: messageText ? messageText.slice(0, 120) : null,
    });

    if (!senderJid || !messageText) {
      console.warn('ReplyUsecase: missing senderJid or message text, skipping reply', { senderJid });
      return null;
    }

    let userPersona = await this.repository.getUserPersonaByPhone(senderJid);
    if (!userPersona && senderPn) {
      const personaByPn = await this.repository.getUserPersonaByPhone(senderPn);
      if (personaByPn) {
        console.info('ReplyUsecase: linked LID sender to existing persona via senderPn', {
          senderJid,
          senderPn,
          userId: personaByPn.user_id,
        });
        await this.repository.updateUserJid(personaByPn.user_id, senderJid);
        userPersona = personaByPn;
      }
    }

    if (!userPersona) {
      const user = await this.repository.getUserByPhone(senderJid);
      if (user && user.role) {
        const personaByRole = await this.repository.getPersonaByName(user.role);
        if (personaByRole) {
          await this.repository.assignPersonaToUser(user.id, personaByRole.id);
          userPersona = {
            user_id: user.id,
            phone: user.phone,
            jid: user.jid,
            user_name: user.name,
            role: user.role,
            persona_id: personaByRole.id,
            persona_name: personaByRole.name,
            system_prompt: personaByRole.system_prompt,
          };
          console.info('ReplyUsecase: auto-linked user role to persona', {
            senderJid,
            senderPn,
            userId: user.id,
            role: user.role,
            personaName: personaByRole.name,
          });
        }
      }
    }

    if (userPersona && userPersona.role && userPersona.persona_name && userPersona.role !== userPersona.persona_name) {
      const personaByRole = await this.repository.getPersonaByName(userPersona.role);
      if (personaByRole && personaByRole.id !== userPersona.persona_id) {
        await this.repository.assignPersonaToUser(userPersona.user_id, personaByRole.id);
        userPersona.persona_id = personaByRole.id;
        userPersona.persona_name = personaByRole.name;
        userPersona.system_prompt = personaByRole.system_prompt;
        console.info('ReplyUsecase: updated persona assignment to match role', {
          senderJid,
          senderPn,
          userId: userPersona.user_id,
          role: userPersona.role,
          personaName: userPersona.persona_name,
        });
      }
    }

    if (!userPersona) {
      console.warn('ReplyUsecase: user persona not found for sender', { senderJid, senderPn, phone });
      return null;
    }

    const contactPhone = userPersona.phone || phone;
    console.info('ReplyUsecase: found persona mapping', {
      userId: userPersona.user_id,
      phone: userPersona.phone,
      jid: userPersona.jid,
      role: userPersona.role,
      personaId: userPersona.persona_id,
      personaName: userPersona.persona_name,
    });

    if (!this.isAllowedContact(userPersona.role, contactPhone)) {
      console.warn('ReplyUsecase: contact not allowed to receive reply', {
        phone: contactPhone,
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
      replyPreview: finalReply ? finalReply.slice(0, 120) : null,
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
