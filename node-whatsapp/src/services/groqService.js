class GroqService {
  constructor({ apiKey, model } = {}) {
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is required to use GroqService.');
    }

    this.apiKey = apiKey;
    this.model = model || 'llama-3.1-8b-instant';
  }

  async generateReply(systemPrompt, userMessage) {
    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    const payload = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
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
      throw new Error(`Groq request failed: ${response.status} ${response.statusText} - ${responseText}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || '';
    return result || null;
  }
}

module.exports = GroqService;
