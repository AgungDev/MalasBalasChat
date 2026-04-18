const OpenAI = require('openai');

class OpenAIService {
  constructor({ apiKey, model }) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required. Set it in your environment.');
    }

    this.client = new OpenAI({ apiKey });
    this.model = model || 'gpt-3.5-turbo';
  }

  async generateReply(systemPrompt, userMessage) {
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    console.info('OpenAIService: sending chat completion request', {
      model: this.model,
      systemPromptLength: systemPrompt?.length || 0,
      userMessagePreview: userMessage ? userMessage.slice(0, 120) : null,
    });

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.8,
        max_tokens: 500,
      });

      const result = response.choices?.[0]?.message?.content?.trim() || '';
      console.info('OpenAIService: received chat completion response', {
        replyPreview: result.slice(0, 120),
        usage: response.usage || null,
      });

      return result;
    } catch (error) {
      console.warn('OpenAIService: OpenAI request failed, using fallback response', {
        error: error.message,
        status: error.status,
      });

      // Fallback responses based on user message content
      const lowerMessage = userMessage.toLowerCase();
      let fallbackReply = '';

      if (lowerMessage.includes('apa') || lowerMessage.includes('lagi')) {
        fallbackReply = 'Lagi santai aja, sayang 😊 Kamu lagi apa?';
      } else if (lowerMessage.includes('halo') || lowerMessage.includes('hai')) {
        fallbackReply = 'Halo sayang! Apa kabar? 💕';
      } else if (lowerMessage.includes('sayang')) {
        fallbackReply = 'Iya sayang, aku di sini kok 💕';
      } else if (lowerMessage.includes('pagi')) {
        fallbackReply = 'Selamat pagi sayang! Semangat hari ini ya 🌅';
      } else if (lowerMessage.includes('malam')) {
        fallbackReply = 'Selamat malam sayang, mimpi indah ya 🌙';
      } else {
        fallbackReply = 'Iya sayang, aku denger kok 😊';
      }

      console.info('OpenAIService: using fallback reply', {
        fallbackReply,
      });

      return fallbackReply;
    }
  }
}

module.exports = OpenAIService;
