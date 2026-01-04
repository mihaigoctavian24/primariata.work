/**
 * Test Card Scenarios
 *
 * Predefined test card numbers that trigger different payment behaviors.
 * Based on industry standards (similar to Stripe test cards).
 */

import type { TestCard } from "./types";

/**
 * Test card definitions with specific behaviors
 */
export const TEST_CARDS: Record<string, TestCard> = {
  // SUCCESS - Instant approval
  SUCCESS_INSTANT: {
    number: "4111111111111111",
    behavior: "success",
    description: "Instant success - payment approved immediately",
    processingTime: 500, // 500ms
  },

  // DECLINED - Insufficient funds
  DECLINED_INSUFFICIENT: {
    number: "4000000000000002",
    behavior: "declined",
    description: "Declined - insufficient funds",
    processingTime: 1000,
    errorCode: "insufficient_funds",
  },

  // EXPIRED - Card expired
  EXPIRED_CARD: {
    number: "4000000000000069",
    behavior: "expired",
    description: "Declined - card expired",
    processingTime: 800,
    errorCode: "card_expired",
  },

  // TIMEOUT - Processing timeout, then success
  TIMEOUT_SUCCESS: {
    number: "4000000000000127",
    behavior: "timeout",
    description: "Processing timeout (10s delay) then success",
    processingTime: 10000, // 10 seconds
  },

  // FRAUD - Suspected fraud
  FRAUD_SUSPECTED: {
    number: "4000000000000341",
    behavior: "fraud",
    description: "Declined - fraud suspected",
    processingTime: 2000,
    errorCode: "fraud_suspected",
  },

  // DECLINED - Generic decline
  DECLINED_GENERIC: {
    number: "4000000000000101",
    behavior: "declined",
    description: "Declined - generic card decline",
    processingTime: 1500,
    errorCode: "card_declined",
  },

  // INVALID - Invalid card number (for testing validation)
  INVALID_CARD: {
    number: "4000000000000259",
    behavior: "declined",
    description: "Declined - invalid card",
    processingTime: 500,
    errorCode: "invalid_card",
  },
};

/**
 * Get test card behavior from card number
 *
 * @param cardNumber - Card number to check
 * @returns TestCard if found, undefined otherwise
 */
export function getTestCardBehavior(cardNumber: string): TestCard | undefined {
  // Remove spaces and dashes
  const cleanNumber = cardNumber.replace(/[\s-]/g, "");

  // Check predefined test cards
  const testCard = Object.values(TEST_CARDS).find((card) => card.number === cleanNumber);

  if (testCard) {
    return testCard;
  }

  // For any other valid 16-digit card number, treat as delayed success
  if (/^\d{16}$/.test(cleanNumber)) {
    return {
      number: cleanNumber,
      behavior: "delayed_success",
      description: "Generic success with realistic delay",
      processingTime: Math.floor(Math.random() * 2000) + 2000, // 2-4 seconds
    };
  }

  return undefined;
}

/**
 * Validate card number format (basic Luhn check)
 *
 * @param cardNumber - Card number to validate
 * @returns true if valid format, false otherwise
 */
export function isValidCardNumber(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/[\s-]/g, "");

  // Must be 13-19 digits
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]!, 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Mask card number (show only last 4 digits)
 *
 * @param cardNumber - Full card number
 * @returns Masked card number (e.g., "**** **** **** 1111")
 */
export function maskCardNumber(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/[\s-]/g, "");

  if (cleanNumber.length < 4) {
    return "****";
  }

  const last4 = cleanNumber.slice(-4);
  const masked = "*".repeat(cleanNumber.length - 4);

  // Format as **** **** **** 1111
  return masked.replace(/(.{4})/g, "$1 ").trim() + " " + last4;
}

/**
 * Get last 4 digits of card
 *
 * @param cardNumber - Full card number
 * @returns Last 4 digits
 */
export function getCardLast4(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/[\s-]/g, "");
  return cleanNumber.slice(-4);
}

/**
 * Determine card brand from number
 *
 * @param cardNumber - Card number
 * @returns Card brand (Visa, Mastercard, etc.)
 */
export function getCardBrand(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/[\s-]/g, "");

  if (/^4/.test(cleanNumber)) {
    return "Visa";
  }

  if (/^5[1-5]/.test(cleanNumber)) {
    return "Mastercard";
  }

  if (/^3[47]/.test(cleanNumber)) {
    return "American Express";
  }

  if (/^6(?:011|5)/.test(cleanNumber)) {
    return "Discover";
  }

  return "Unknown";
}

/**
 * Get all test card numbers for documentation
 *
 * @returns Array of test cards with descriptions
 */
export function getAllTestCards(): Array<{
  number: string;
  description: string;
  expectedResult: string;
}> {
  return Object.values(TEST_CARDS).map((card) => ({
    number: card.number,
    description: card.description,
    expectedResult:
      card.behavior === "success" ||
      card.behavior === "timeout" ||
      card.behavior === "delayed_success"
        ? "Success"
        : `Failed: ${card.errorCode || "unknown"}`,
  }));
}
