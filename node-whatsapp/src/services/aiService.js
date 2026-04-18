class AIService {
  constructor(openAIService, geminiService, groqService) {
    this.providers = [
      { name: 'OpenAI', service: openAIService, available: Boolean(openAIService) },
      { name: 'Gemini', service: geminiService, available: Boolean(geminiService) },
      { name: 'Groq', service: groqService, available: Boolean(groqService) },
    ];
  }

  async generateReply(systemPrompt, userMessage) {
    if (!systemPrompt || !userMessage) {
      return null;
    }

    for (const provider of this.providers) {
      if (!provider.available || !provider.service) {
        continue;
      }

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
        console.warn('AIService: provider returned empty reply and will be disabled', {
          provider: provider.name,
        });
      } catch (error) {
        provider.available = false;
        console.warn('AIService: provider request failed and will be disabled', {
          provider: provider.name,
          error: error.message,
          status: error.status,
        });
      }
    }

    console.error('AIService: all providers failed or disabled, not sending reply');
    return null;
  }
}

module.exports = AIService;
