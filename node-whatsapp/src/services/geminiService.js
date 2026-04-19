class GeminiService {
  constructor({ apiKey, model } = {}) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required to use GeminiService.');
    }

    this.apiKey = apiKey;
    this.model = model || 'gemini-2.5-flash-lite';
    this.fallbackModels = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
  }

  async generateReply(systemPrompt, userMessage) {
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

    const modelCandidates = [
      this.model,
      ...this.fallbackModels.filter((candidate) => candidate !== this.model),
    ];

    let lastError;

    for (const model of modelCandidates) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const responseText = await response.text();
          const error = new Error(`Gemini request failed: ${response.status} ${response.statusText} - ${responseText}`);
          error.status = response.status;
          error.responseText = responseText;

          if (response.status === 404 && model !== this.model) {
            console.warn('GeminiService: fallback model also failed, continuing to next candidate', {
              model,
              status: response.status,
            });
            lastError = error;
            continue;
          }

          throw error;
        }

        const data = await response.json();
        const result = this.extractGeminiText(data);
        return result ? result.trim() : null;
      } catch (error) {
        if (error.status === 404 && model === this.model) {
          console.warn('GeminiService: configured model failed, trying fallback model', {
            model,
            error: error.message,
          });
          lastError = error;
          continue;
        }

        throw error;
      }
    }

    if (lastError) {
      throw lastError;
    }

    return null;
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
