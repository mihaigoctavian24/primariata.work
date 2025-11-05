/**
 * Mock OpenAI Client for Testing
 */

export const chatCompletion = jest.fn();

export const AI_MODELS = {
  ANALYSIS: { model: "gpt-4o-mini", temperature: 0.3, maxTokens: 4096 },
  INSIGHTS: { model: "gpt-4o-mini", temperature: 0.5, maxTokens: 2048 },
  SUMMARIZATION: { model: "gpt-4o-mini", temperature: 0.4, maxTokens: 1024 },
};

export const getOpenAIClient = jest.fn();
export const estimateTokens = jest.fn((text: string) => Math.ceil(text.length / 2.5));
export const isWithinTokenLimit = jest.fn(
  (text: string, maxTokens: number) => estimateTokens(text) <= maxTokens
);
export const truncateToTokenLimit = jest.fn((text: string, maxTokens: number) => {
  if (isWithinTokenLimit(text, maxTokens)) return text;
  const avgCharsPerToken = 2.5;
  return text.substring(0, Math.floor(maxTokens * avgCharsPerToken));
});
export const testOpenAIConnection = jest.fn();
