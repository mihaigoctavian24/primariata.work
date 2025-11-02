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
export const estimateTokens = jest.fn((_text: string) => Math.ceil(_text.length / 2.5));
export const isWithinTokenLimit = jest.fn((_text: string, _maxTokens: number) => true);
export const truncateToTokenLimit = jest.fn((_text: string, _maxTokens: number) => _text);
export const testOpenAIConnection = jest.fn();
