/**
 * Test OpenAI Connection
 *
 * Run with: tsx scripts/test-openai-connection.ts
 */

import { testOpenAIConnection, chatCompletion, AI_MODELS } from "../src/lib/ai/openai-client";

async function main() {
  console.log("🔍 Testing OpenAI Connection...\n");

  // Test 1: Basic connection test
  console.log("Test 1: Basic Connection");
  const connectionOk = await testOpenAIConnection();

  if (!connectionOk) {
    console.error("❌ Connection test failed. Check your OPENAI_API_KEY.");
    process.exit(1);
  }

  // Test 2: Romanian language test
  console.log("\nTest 2: Romanian Language Understanding");
  const romanianTest = await chatCompletion({
    ...AI_MODELS.SUMMARIZATION,
    userPrompt: "Rezumă în 2 propoziții ce înseamnă digitalizarea serviciilor publice.",
  });

  console.log("Response:", romanianTest.content);
  console.log("Tokens used:", romanianTest.usage.totalTokens);

  // Test 3: JSON mode test
  console.log("\nTest 3: JSON Output Mode");
  const jsonTest = await chatCompletion({
    ...AI_MODELS.ANALYSIS,
    systemPrompt: "You are a helpful assistant that outputs JSON.",
    userPrompt:
      'Generate a JSON object with fields: { "message": "success", "timestamp": "current time" }',
    jsonMode: true,
  });

  console.log("JSON Response:", jsonTest.content);

  // Test 4: Sentiment analysis test
  console.log("\nTest 4: Sentiment Analysis (Romanian)");
  const sentimentTest = await chatCompletion({
    ...AI_MODELS.ANALYSIS,
    systemPrompt: `Analizează sentimentul textului în limba română.
Returnează un JSON cu: { "sentiment": "positive/negative/neutral", "score": number between -1 and 1, "explanation": "..." }`,
    userPrompt:
      'Text: "Aplicația este excelentă! Foarte ușor de folosit și utilă pentru cetățeni."',
    jsonMode: true,
  });

  console.log("Sentiment:", sentimentTest.content);

  console.log("\n✅ All tests passed!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
