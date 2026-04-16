const Anthropic = require('@anthropic-ai/sdk');

/**
 * Summarize the last batch of conversations for a loved one (PRD: every ~20 turns).
 * @param {import('@prisma/client').PrismaClient} prisma
 */
async function createSummaryForLovedOne(prisma, lovedOneId, userId) {
  const batch = await prisma.conversation.findMany({
    where: { lovedOneId, userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  if (batch.length === 0) return null;

  const chronological = [...batch].reverse();
  const transcript = chronological
    .map((c) => `User: ${c.userMessage}\n${c.aiResponse}`)
    .join('\n\n');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });
  const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system:
      'You summarize private voice-chat transcripts for a memory system. Output JSON only: {"summary":"...","themes":["..."]} — summary under 400 words; themes max 8 short labels.',
    messages: [
      {
        role: 'user',
        content: `Summarize these exchanges:\n\n${transcript}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock) return null;

  let summaryText = textBlock.text.trim();
  let themes = [];
  try {
    const parsed = JSON.parse(summaryText.replace(/^```json\n?|\n?```$/g, ''));
    summaryText = parsed.summary || summaryText;
    themes = Array.isArray(parsed.themes) ? parsed.themes : [];
  } catch {
    // keep raw summaryText
  }

  const startId = chronological[0]?.id;
  const endId = chronological[chronological.length - 1]?.id;

  return prisma.memorySummary.create({
    data: {
      lovedOneId,
      summaryText,
      conversationStartId: startId,
      conversationEndId: endId,
      themes,
    },
  });
}

module.exports = { createSummaryForLovedOne };
