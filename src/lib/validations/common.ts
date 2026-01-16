import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

/**
 * Common Validation Schemas and Utilities
 *
 * Provides reusable, security-hardened validation schemas for:
 * - Romanian-specific formats (CNP, phone, IBAN, postal codes)
 * - XSS-protected string validation
 * - File name and URL validation
 * - Email and phone normalization
 *
 * Security Features:
 * - HTML sanitization via DOMPurify
 * - Path traversal prevention
 * - SSRF protection for URLs
 * - CNP checksum validation
 * - String length limits
 */

// =============================================================================
// ROMANIAN-SPECIFIC PATTERNS
// =============================================================================

export const ROMANIAN_PATTERNS = {
  /**
   * CNP (Cod Numeric Personal) - Romanian personal ID
   * Format: SAALLZZJJNNNC
   * - S: Sex and century (1-9)
   * - AA: Year (00-99)
   * - LL: Month (01-12)
   * - ZZ: Day (01-31)
   * - JJ: County code (01-52)
   * - NNN: Sequence number
   * - C: Checksum digit
   */
  CNP: /^[1-9]\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{6}$/,

  /**
   * Romanian phone number
   * Formats: +40712345678 or 0712345678
   */
  PHONE: /^(\+40|0)(7\d{8})$/,

  /**
   * Romanian mobile phone (stricter - only mobile prefixes)
   * Prefixes: 07xx where xx is between 20-99
   */
  MOBILE: /^(\+40|0)(7[2-9]\d{7})$/,

  /**
   * Romanian postal code (6 digits)
   */
  POSTAL_CODE: /^\d{6}$/,

  /**
   * Romanian IBAN
   * Format: RO + 2 check digits + 4 bank code letters + 16 account digits
   */
  IBAN: /^RO\d{2}[A-Z]{4}\d{16}$/,

  /**
   * Romanian car plate
   * Formats: B123ABC, AB12ABC, AB123ABC
   */
  CAR_PLATE: /^[A-Z]{1,2}\d{2,3}[A-Z]{3}$/,
} as const;

// =============================================================================
// SAFE STRING VALIDATION
// =============================================================================

/**
 * Create a safe string schema with XSS protection
 *
 * Features:
 * - Automatic whitespace trimming
 * - Length constraints
 * - Pattern matching
 * - HTML sanitization (removes <script>, onclick, etc.)
 * - Optional empty string handling
 *
 * @example
 * const nameSchema = createSafeStringSchema({
 *   minLength: 2,
 *   maxLength: 100,
 *   sanitize: true
 * });
 */
export const createSafeStringSchema = (options: {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternError?: string;
  allowEmpty?: boolean;
  sanitize?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let schema: any = z.string();

  // Trim whitespace
  schema = schema.trim();

  // Length constraints
  if (options.minLength !== undefined) {
    schema = schema.min(options.minLength, `Minim ${options.minLength} caractere`);
  }

  if (options.maxLength !== undefined) {
    schema = schema.max(options.maxLength, `Maxim ${options.maxLength} caractere`);
  }

  // Pattern validation
  if (options.pattern) {
    schema = schema.regex(options.pattern, options.patternError || "Format invalid");
  }

  // Sanitization transform
  if (options.sanitize) {
    schema = schema.transform((val: string) =>
      DOMPurify.sanitize(val, {
        ALLOWED_TAGS: [], // Strip all HTML tags
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true, // Keep text content, just remove tags
      })
    );
  }

  // Allow empty (optional)
  if (options.allowEmpty) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return schema.optional().or(z.literal("")) as any;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return schema as any;
};

// =============================================================================
// EMAIL VALIDATION
// =============================================================================

/**
 * Email validation (stricter than default Zod)
 *
 * Features:
 * - RFC 5321 compliant (max 254 chars)
 * - No consecutive dots
 * - Valid TLD (at least 2 chars)
 * - Case normalization (lowercase)
 * - Trim whitespace
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Adresă de email invalidă")
  .min(5, "Email prea scurt")
  .max(254, "Email prea lung") // RFC 5321 limit
  .refine(
    (email) => {
      // Additional validation: no consecutive dots, valid TLD
      const domain = email.split("@")[1];
      if (!domain) return false;
      const tld = domain.split(".").pop();
      return !email.includes("..") && domain.includes(".") && (tld?.length ?? 0) >= 2;
    },
    { message: "Format email invalid" }
  );

// =============================================================================
// PHONE VALIDATION
// =============================================================================

/**
 * Phone number validation (Romanian format)
 *
 * Features:
 * - Accepts: +40712345678 or 0712345678
 * - Normalizes to +40 format
 * - Validates mobile prefixes (07xx)
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(ROMANIAN_PATTERNS.PHONE, "Număr de telefon invalid (ex: 0712345678 sau +40712345678)")
  .transform((phone: string) => {
    // Normalize to +40 format
    if (phone.startsWith("07")) {
      return "+4" + phone.substring(1);
    }
    return phone;
  });

/**
 * Optional phone schema (allows empty string)
 */
export const optionalPhoneSchema = phoneSchema.optional().or(z.literal(""));

// =============================================================================
// CNP VALIDATION (Romanian Personal ID)
// =============================================================================

/**
 * CNP validation with checksum algorithm
 *
 * The checksum is calculated using a weighted sum modulo 11:
 * - Weights: [2,7,9,1,4,6,3,5,8,2,7,9]
 * - If sum % 11 = 10, checksum is 1
 * - Otherwise, checksum is sum % 11
 *
 * @example
 * Valid CNP: 1800101123456
 * - S=1 (male, born 1800-1899)
 * - AA=80 (year 1880)
 * - LL=01 (January)
 * - ZZ=01 (1st day)
 * - JJ=12 (county code)
 * - NNN=345 (sequence)
 * - C=6 (checksum)
 */
export const cnpSchema = z
  .string()
  .trim()
  .regex(ROMANIAN_PATTERNS.CNP, "CNP invalid (format: 13 cifre)")
  .refine(
    (cnp) => {
      // Validate checksum digit
      const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cnp[i]!) * weights[i]!;
      }
      const checksum = sum % 11 === 10 ? 1 : sum % 11;
      return checksum === parseInt(cnp[12]!);
    },
    { message: "CNP invalid (cifră de control incorectă)" }
  );

/**
 * Optional CNP schema (allows empty string)
 */
export const optionalCnpSchema = cnpSchema.optional().or(z.literal(""));

// =============================================================================
// URL VALIDATION
// =============================================================================

/**
 * URL validation with security hardening
 *
 * Security Features:
 * - HTTPS only (prevents mixed content)
 * - Blocks localhost/private IPs (SSRF prevention)
 * - Blocks common private IP ranges
 *
 * SSRF (Server-Side Request Forgery) Prevention:
 * Blocks: 127.0.0.1, localhost, 192.168.x.x, 10.x.x.x, 172.16-31.x.x
 */
export const urlSchema = z
  .string()
  .trim()
  .url("URL invalid")
  .refine((url) => url.startsWith("https://"), {
    message: "Doar URL-uri HTTPS sunt permise",
  })
  .refine(
    (url) => {
      // Block localhost/private IPs (SSRF prevention)
      const hostname = new URL(url).hostname;
      return (
        !hostname.includes("localhost") &&
        !hostname.includes("127.0.0.1") &&
        !hostname.includes("0.0.0.0") &&
        !hostname.match(/^192\.168\./) &&
        !hostname.match(/^10\./) &&
        !hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
      );
    },
    { message: "URL privat nu este permis" }
  );

// =============================================================================
// FILENAME VALIDATION
// =============================================================================

/**
 * Filename validation with path traversal prevention
 *
 * Security Features:
 * - No path traversal (no ../, ..\, /, \)
 * - No null bytes (security)
 * - Length limits (1-255 chars)
 * - Sanitization: only alphanumeric, hyphens, underscores, dots
 *
 * @example
 * Valid: "document.pdf", "report-2024.xlsx"
 * Invalid: "../etc/passwd", "file\0.txt"
 */
export const filenameSchema = z
  .string()
  .trim()
  .min(1, "Nume fișier lipsă")
  .max(255, "Nume fișier prea lung")
  .refine(
    (filename) => !filename.includes("..") && !filename.includes("/") && !filename.includes("\\"),
    {
      message: "Nume fișier invalid (path traversal detectat)",
    }
  )
  .refine((filename) => !filename.includes("\0"), {
    message: "Nume fișier conține caractere invalide (null byte)",
  })
  .transform((filename) => {
    // Sanitize: keep only alphanumeric, hyphens, underscores, dots
    return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  });

// =============================================================================
// AMOUNT VALIDATION
// =============================================================================

/**
 * Amount validation for payments (Romanian RON)
 *
 * Features:
 * - Positive numbers only
 * - Finite values (no Infinity, NaN)
 * - Min: 1 RON
 * - Max: 1,000,000 RON
 * - Precision: 2 decimal places (pennies)
 */
export const amountSchema = z
  .number()
  .positive("Suma trebuie să fie pozitivă")
  .finite("Suma trebuie să fie un număr valid")
  .min(1, "Suma minimă este 1 RON")
  .max(1000000, "Suma maximă este 1,000,000 RON")
  .multipleOf(0.01, "Suma trebuie să aibă maxim 2 zecimale");

// =============================================================================
// ROMANIAN POSTAL CODE
// =============================================================================

/**
 * Romanian postal code validation
 * Format: 6 digits (e.g., 010101 for Bucharest Sector 1)
 */
export const postalCodeSchema = z
  .string()
  .trim()
  .regex(ROMANIAN_PATTERNS.POSTAL_CODE, "Cod poștal invalid (6 cifre)");

// =============================================================================
// ROMANIAN IBAN
// =============================================================================

/**
 * Romanian IBAN validation
 * Format: RO + 2 check digits + 4 bank letters + 16 account digits
 * Example: RO49AAAA1B31007593840000
 */
export const ibanSchema = z
  .string()
  .trim()
  .regex(ROMANIAN_PATTERNS.IBAN, "IBAN invalid (format românesc)");

// =============================================================================
// UUID VALIDATION
// =============================================================================

/**
 * UUID validation (for database IDs)
 */
export const uuidSchema = z.string().uuid("ID invalid");

// =============================================================================
// DATE VALIDATION
// =============================================================================

/**
 * ISO date string validation (YYYY-MM-DD)
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalidă (format: AAAA-LL-ZZ)")
  .refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: "Data invalidă" }
  );

// =============================================================================
// PASSWORD VALIDATION
// =============================================================================

/**
 * Password validation with complexity requirements
 *
 * Requirements:
 * - Min 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 * - At least 1 special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Parola trebuie să conțină cel puțin 8 caractere")
  .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
  .regex(/[a-z]/, "Parola trebuie să conțină cel puțin o literă mică")
  .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră")
  .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special");

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate password strength
 * Returns score 0-4: weak (0-1), medium (2), strong (3), very strong (4)
 */
export function calculatePasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return Math.min(strength, 4);
}

/**
 * Get password strength label in Romanian
 */
export function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return "Slabă";
    case 2:
      return "Medie";
    case 3:
      return "Puternică";
    case 4:
      return "Foarte puternică";
    default:
      return "Slabă";
  }
}

// =============================================================================
// VALIDATOR ALIASES (for test compatibility)
// =============================================================================

/**
 * Export schema validators with "Validator" suffix for test compatibility
 * Tests expect `cnpValidator.parse()` syntax
 */
export const cnpValidator = cnpSchema;
export const romanianPhoneValidator = phoneSchema;
export const romanianIBANValidator = ibanSchema;

// =============================================================================
// JSONB SIZE VALIDATION
// =============================================================================

/**
 * Validate JSONB object size (prevent DoS via large payloads)
 * Max 100KB serialized size, max 100 keys
 *
 * Using z.object({}).passthrough() for Zod v4 compatibility (replaces z.record(z.unknown()))
 */
export const jsonbSizeValidator = z
  .object({})
  .passthrough()
  .refine((obj) => JSON.stringify(obj).length <= 100 * 1024, {
    message: "Obiect prea mare (maxim 100KB)",
  })
  .refine((obj) => Object.keys(obj).length <= 100, {
    message: "Prea multe chei (maxim 100)",
  });

// =============================================================================
// PATH TRAVERSAL PREVENTION
// =============================================================================

/**
 * Prevent path traversal attacks (../, ..\\, etc.)
 */
export const preventPathTraversal = z
  .string()
  .refine((path) => !path.includes("..") && !path.includes("\\") && !path.startsWith("/"), {
    message: "Path traversal detectat",
  });

// =============================================================================
// SSRF PREVENTION
// =============================================================================

/**
 * Prevent Server-Side Request Forgery (SSRF) attacks
 * Block private IPs, localhost, etc.
 */
export const preventSSRF = z
  .string()
  .url()
  .refine(
    (url) => {
      const hostname = new URL(url).hostname;
      return (
        !hostname.includes("localhost") &&
        !hostname.includes("127.0.0.1") &&
        !hostname.includes("0.0.0.0") &&
        !hostname.match(/^192\.168\./) &&
        !hostname.match(/^10\./) &&
        !hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
      );
    },
    { message: "SSRF prevention: URL privat nu este permis" }
  );
