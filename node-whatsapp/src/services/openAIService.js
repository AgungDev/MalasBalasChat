const OpenAI = require('openai');

class OpenAIService {
  constructor({ apiKey, model } = {}) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required to use OpenAIService.');
    }

    this.client = new OpenAI({ apiKey });
    this.model = model || 'gpt-3.5-turbo';
  }

  async generateReply(systemPrompt, userMessage, personaRole = '', personaName = '') {
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
      personaRole,
      personaName,
      userMessagePreview: userMessage ? userMessage.slice(0, 120) : null,
    });

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
  }
}

module.exports = OpenAIService;
