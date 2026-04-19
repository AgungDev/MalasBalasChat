class AIService {
  constructor(openAIService, geminiService, groqService, options = {}) {
    this.providerCooldownMs = typeof options.providerCooldownMs === 'number' ? options.providerCooldownMs : 60_000;
    this.providers = [
      { name: 'OpenAI', service: openAIService, available: Boolean(openAIService), disabledUntil: null },
      { name: 'Gemini', service: geminiService, available: Boolean(geminiService), disabledUntil: null },
      { name: 'Groq', service: groqService, available: Boolean(groqService), disabledUntil: null },
    ];
  }

  _restoreProviders() {
    const now = Date.now();

    for (const provider of this.providers) {
      if (provider.disabledUntil && provider.disabledUntil <= now) {
        provider.disabledUntil = null;
        provider.available = Boolean(provider.service);
        console.info('AIService: provider re-enabled', {
          provider: provider.name,
        });
      }
    }
  }

  async generateReply(systemPrompt, userMessage) {
    if (!systemPrompt || !userMessage) {
      return null;
    }

    this._restoreProviders();

    let providerTried = false;

    for (const provider of this.providers) {
      if (!provider.available || !provider.service) {
        continue;
      }

      providerTried = true;

      try {
        const reply = await provider.service.generateReply(systemPrompt, userMessage);
        if (reply) {
          console.info('AIService: provider succeeded', {
            provider: provider.name,
            replyPreview: reply.slice(0, 120),
          });
          return reply;
        }

        provider.available = false;
        provider.disabledUntil = Date.now() + this.providerCooldownMs;
        console.warn('AIService: provider returned empty reply and will be disabled temporarily', {
          provider: provider.name,
          disabledUntil: provider.disabledUntil,
        });
      } catch (error) {
        provider.available = false;
        provider.disabledUntil = Date.now() + this.providerCooldownMs;
        console.warn('AIService: provider request failed and will be disabled temporarily', {
          provider: provider.name,
          error: error.message,
          status: error.status,
          disabledUntil: provider.disabledUntil,
        });
      }
    }

    if (!providerTried) {
      this._restoreProviders();
    }

    console.error('AIService: all providers failed or disabled, not sending reply');
    return null;
  }
}

module.exports = AIService;
