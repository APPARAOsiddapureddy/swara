const Anthropic = require('@anthropic-ai/sdk');

/**
 * Generate an AI response using Claude.
 * @param {string} systemPrompt - The persona/context system prompt
 * @param {string} userMessage - The transcribed user message
 * @returns {Promise<string>} - The AI's text response
 */
const generateResponse = async (systemPrompt, userMessage, options = {}) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const client = new Anthropic({ apiKey });
  const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';
  const maxTokens = options.maxTokens ?? 300;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    if (!response.content || response.content.length === 0) {
      throw new Error('Empty response from Claude');
    }

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock) {
      throw new Error('No text block in Claude response');
    }

    return textBlock.text.trim();
  } catch (err) {
    console.error('Claude API error:', err);
    throw new Error(`Claude API failed: ${err.message}`);
  }
};

module.exports = { generateResponse };
