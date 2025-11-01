/**
 * OpenAI Client Wrapper
 *
 * Singleton client for OpenAI API with error handling, retries, and rate limiting
 */

import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// =====================================================
// CLIENT INITIALIZATION
// =====================================================

let openaiClient: OpenAI | null = null;

/**
 * Get or create OpenAI client instance (singleton pattern)
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured. Please add it to .env.local");
    }

    openaiClient = new OpenAI({
      apiKey,
      timeout: 60000, // 60 seconds (increased for complex analysis)
      maxRetries: 3, // Retry failed requests up to 3 times
    });

    console.log("✅ OpenAI client initialized successfully");
  }

  return openaiClient;
}

// =====================================================
// AI MODEL CONFIGURATION
// =====================================================

/**
 * AI Model Configuration
 */
export interface AIModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/**
 * Default model configurations for different use cases
 */
export const AI_MODELS = {
  // GPT-4 Turbo - Best for complex analysis
  ANALYSIS: {
    model: "gpt-4-turbo-preview",
    temperature: 0.3, // Low temperature for consistent analysis
    maxTokens: 4096,
  } as AIModelConfig,

  // GPT-4 - High quality for important tasks
  INSIGHTS: {
    model: "gpt-4",
    temperature: 0.5, // Moderate creativity
    maxTokens: 2048,
  } as AIModelConfig,

  // GPT-3.5 Turbo - Fast and cost-effective for simple tasks
  SUMMARIZATION: {
    model: "gpt-3.5-turbo",
    temperature: 0.4,
    maxTokens: 1024,
  } as AIModelConfig,
} as const;

// =====================================================
// CHAT COMPLETION HELPER
// =====================================================

/**
 * Chat Completion Options
 */
export interface ChatCompletionOptions extends AIModelConfig {
  systemPrompt?: string;
  userPrompt: string;
  jsonMode?: boolean; // Enable JSON output mode
}

/**
 * Chat Completion Response
 */
export interface ChatCompletionResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

/**
 * Execute chat completion with OpenAI
 */
export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResponse> {
  const client = getOpenAIClient();

  const messages: ChatCompletionMessageParam[] = [];

  if (options.systemPrompt) {
    messages.push({
      role: "system",
      content: options.systemPrompt,
    });
  }

  messages.push({
    role: "user",
    content: options.userPrompt,
  });

  try {
    const completion = await client.chat.completions.create({
      model: options.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      top_p: options.topP,
      frequency_penalty: options.frequencyPenalty,
      presence_penalty: options.presencePenalty,
      response_format: options.jsonMode ? { type: "json_object" } : undefined,
    });

    const choice = completion.choices[0];

    if (!choice || !choice.message.content) {
      throw new Error("No response content from OpenAI");
    }

    return {
      content: choice.message.content,
      usage: {
        promptTokens: completion.usage?.prompt_tokens ?? 0,
        completionTokens: completion.usage?.completion_tokens ?? 0,
        totalTokens: completion.usage?.total_tokens ?? 0,
      },
      model: completion.model,
      finishReason: choice.finish_reason,
    };
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);

    if (error instanceof OpenAI.APIError) {
      // Handle specific OpenAI errors
      if (error.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a few moments.");
      } else if (error.status === 401) {
        throw new Error("Invalid OpenAI API key. Please check configuration.");
      } else if (error.status === 500) {
        throw new Error("OpenAI service error. Please try again later.");
      }
    }

    throw error;
  }
}

// =====================================================
// STREAMING SUPPORT (for future use)
// =====================================================

/**
 * Stream chat completion (for real-time updates)
 */
export async function* streamChatCompletion(
  options: ChatCompletionOptions
): AsyncGenerator<string, void, unknown> {
  const client = getOpenAIClient();

  const messages: ChatCompletionMessageParam[] = [];

  if (options.systemPrompt) {
    messages.push({
      role: "system",
      content: options.systemPrompt,
    });
  }

  messages.push({
    role: "user",
    content: options.userPrompt,
  });

  try {
    const stream = await client.chat.completions.create({
      model: options.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("❌ OpenAI Streaming Error:", error);
    throw error;
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Estimate token count (rough approximation)
 * 1 token ≈ 4 characters for English, ≈ 2 characters for Romanian
 */
export function estimateTokens(text: string): number {
  // Conservative estimate: 1 token per 2.5 characters for Romanian
  return Math.ceil(text.length / 2.5);
}

/**
 * Check if text is within token limits
 */
export function isWithinTokenLimit(text: string, maxTokens: number): boolean {
  return estimateTokens(text) <= maxTokens;
}

/**
 * Truncate text to fit within token limit
 */
export function truncateToTokenLimit(text: string, maxTokens: number): string {
  const estimatedTokens = estimateTokens(text);

  if (estimatedTokens <= maxTokens) {
    return text;
  }

  // Truncate to approximate character limit
  const maxChars = Math.floor(maxTokens * 2.5);
  return text.substring(0, maxChars) + "...";
}

/**
 * Test OpenAI connection
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const response = await chatCompletion({
      model: AI_MODELS.SUMMARIZATION.model,
      userPrompt: "Spune 'OK' dacă mă auzi.",
      maxTokens: 10,
    });

    console.log("✅ OpenAI connection test successful:", response.content);
    return true;
  } catch (error) {
    console.error("❌ OpenAI connection test failed:", error);
    return false;
  }
}
