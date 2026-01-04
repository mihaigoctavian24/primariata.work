/**
 * Test script for Twilio SMS delivery
 *
 * Purpose: Verify that SMS notifications work correctly with Twilio integration
 *
 * Usage:
 *   tsx scripts/test-sms-delivery.ts
 *
 * Prerequisites:
 *   - Twilio credentials configured in .env.local
 *   - Test user with phone number and SMS enabled in database
 *   - Test cerere exists in database
 */

import { config } from "dotenv";
import { resolve } from "path";

// CRITICAL: Load environment variables BEFORE importing SMS module
config({ path: resolve(__dirname, "../.env.local") });

// Test configuration
const TEST_CONFIG = {
  // User from Supabase (mihai.g.octavian24@stud.rau.ro)
  userId: "160ff213-66b4-421a-9dcd-155a4277f66c",

  // Verified phone number in Twilio trial account
  phoneNumber: "+40745163828",

  // Test cerere (Autorizație de Construcție - B-SE-2026-00001)
  cerereId: "8469d493-2f1a-43df-9d6d-da7d936acaca",
};

async function testSMSDelivery() {
  console.log("🧪 Testing Twilio SMS Delivery...\n");

  try {
    // Dynamic import AFTER env vars are loaded
    const { sendCerereSubmittedSMS, sendStatusChangedSMS, sendCerereFinalizataSMS } = await import(
      "../src/lib/sms"
    );

    // Test 1: Cerere Submitted SMS
    console.log("📱 Test 1: Cerere Submitted SMS");
    const result1 = await sendCerereSubmittedSMS(
      TEST_CONFIG.phoneNumber,
      TEST_CONFIG.cerereId,
      TEST_CONFIG.userId
    );

    if (result1.success) {
      console.log("✅ Cerere submitted SMS sent successfully!");
      console.log(`   Twilio SID: ${result1.sid}`);
    } else {
      console.error("❌ Failed to send cerere submitted SMS:");
      console.error(`   Error: ${result1.error}`);
    }

    console.log("\n" + "─".repeat(60) + "\n");

    // Wait 2 seconds to avoid rate limiting between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test 2: Status Changed SMS
    console.log("📱 Test 2: Status Changed SMS");
    const result2 = await sendStatusChangedSMS(
      TEST_CONFIG.phoneNumber,
      TEST_CONFIG.cerereId,
      TEST_CONFIG.userId
    );

    if (result2.success) {
      console.log("✅ Status changed SMS sent successfully!");
      console.log(`   Twilio SID: ${result2.sid}`);
    } else {
      console.error("❌ Failed to send status changed SMS:");
      console.error(`   Error: ${result2.error}`);
    }

    console.log("\n" + "─".repeat(60) + "\n");

    // Wait 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test 3: Cerere Finalizata SMS
    console.log("📱 Test 3: Cerere Finalizata SMS");
    const result3 = await sendCerereFinalizataSMS(
      TEST_CONFIG.phoneNumber,
      TEST_CONFIG.cerereId,
      TEST_CONFIG.userId
    );

    if (result3.success) {
      console.log("✅ Cerere finalizata SMS sent successfully!");
      console.log(`   Twilio SID: ${result3.sid}`);
    } else {
      console.error("❌ Failed to send cerere finalizata SMS:");
      console.error(`   Error: ${result3.error}`);
    }

    console.log("\n" + "─".repeat(60) + "\n");
    console.log("🎯 SMS Testing Complete!");
  } catch (error) {
    console.error("💥 Unexpected error during SMS testing:");
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testSMSDelivery();
