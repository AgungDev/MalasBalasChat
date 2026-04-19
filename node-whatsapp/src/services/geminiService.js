class GeminiService {
  constructor({ apiKey, model } = {}) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required to use GeminiService.');
    }

    this.apiKey = apiKey;
    this.model = model || 'gemini-1.5-pro';
  }

  async generateReply(systemPrompt, userMessage) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt + '\n\nUser message: ' + userMessage },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    const parts = candidate?.content?.parts;
    if (!Array.isArray(parts) || parts.length === 0) {
      return null;
    }

    const textPart = parts.find((p) => p.text);
    if (textPart?.text) {
      return textPart.text;
    }

    return null;
  }
}

module.exports = GeminiService;
