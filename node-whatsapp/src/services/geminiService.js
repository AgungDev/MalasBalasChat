class GeminiService {
  constructor({ apiKey, model } = {}) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required to use GeminiService.');
    }

    this.apiKey = apiKey;
    this.model = model || 'gemini-1.5-pro';
  }

  async generateReply(systemPrompt, userMessage) {
    const endpoint = `https://gemini.googleapis.com/v1/models/${this.model}:generateMessage`;
    const payload = {
      prompt: {
        messages: [
          { author: 'system', content: systemPrompt },
          { author: 'user', content: userMessage },
        ],
      },
      temperature: 0.8,
      maxOutputTokens: 500,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Gemini request failed: ${response.status} ${response.statusText} - ${responseText}`);
    }

    const data = await response.json();
    const result = this.extractGeminiText(data);
    return result ? result.trim() : null;
  }

  extractGeminiText(data) {
    if (!data) {
      return null;
    }

    const candidate = data?.candidates?.[0];
    if (!candidate) {
      return null;
    }

    const content = candidate.content;
    if (!content) {
      return null;
    }

    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      for (const item of content) {
        if (typeof item === 'string') {
          return item;
        }

        if (item?.text) {
          return item.text;
        }

        if (item?.message?.content?.text) {
          return item.message.content.text;
        }
      }
    }

    if (typeof content?.text === 'string') {
      return content.text;
    }

    return null;
  }
}

module.exports = GeminiService;
