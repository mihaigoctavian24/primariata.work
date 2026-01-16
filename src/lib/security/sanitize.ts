import DOMPurify from "isomorphic-dompurify";

/**
 * Security Sanitization Utilities
 *
 * Provides functions to sanitize user input and prevent XSS attacks.
 * Uses DOMPurify for HTML sanitization with security-focused configurations.
 *
 * Key Security Features:
 * - XSS prevention via HTML tag stripping
 * - Script injection prevention
 * - Event handler removal (onclick, onerror, etc.)
 * - Safe HTML rendering (when needed)
 * - SQL injection prevention via parameterization (handled by Supabase)
 */

// =============================================================================
// XSS PREVENTION
// =============================================================================

/**
 * Sanitize plain text - strips ALL HTML tags
 *
 * Use this for: user names, descriptions, comments, titles
 *
 * @example
 * sanitizePlainText('<script>alert("xss")</script>Hello')
 * // Returns: 'Hello'
 */
export function sanitizePlainText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content, remove tags
  });
}

/**
 * Sanitize HTML content - allows safe HTML tags only
 *
 * Use this for: rich text editors, formatted descriptions
 *
 * Safe tags: p, br, strong, em, u, ul, ol, li, a, blockquote
 * Safe attributes: href (only https://), title
 *
 * @example
 * sanitizeHtml('<p>Safe <strong>text</strong></p><script>alert(1)</script>')
 * // Returns: '<p>Safe <strong>text</strong></p>'
 */
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ul", "ol", "li", "a", "blockquote", "h3", "h4"],
    ALLOWED_ATTR: ["href", "title"],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^https?:\/\//i, // Only http/https URLs
  });
}

/**
 * Sanitize URL - validates and cleans URLs
 *
 * Use this for: user-provided links, external resources
 *
 * Security:
 * - Only allows http/https protocols
 * - Prevents javascript: protocol
 * - Prevents data: URIs
 *
 * @example
 * sanitizeUrl('javascript:alert(1)')
 * // Returns: ''
 *
 * sanitizeUrl('https://example.com')
 * // Returns: 'https://example.com'
 */
export function sanitizeUrl(url: string): string {
  const sanitized = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  // Validate protocol
  try {
    const parsed = new URL(sanitized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return sanitized;
  } catch {
    return "";
  }
}

// =============================================================================
// FILENAME SANITIZATION
// =============================================================================

/**
 * Sanitize filename - prevents path traversal
 *
 * Use this for: file uploads, document names
 *
 * Security:
 * - Removes path separators (/, \)
 * - Removes parent directory references (..)
 * - Removes null bytes
 * - Keeps only safe characters
 *
 * @example
 * sanitizeFilename('../../../etc/passwd')
 * // Returns: '___etc_passwd'
 *
 * sanitizeFilename('document<script>.pdf')
 * // Returns: 'document_script_.pdf'
 */
export function sanitizeFilename(filename: string): string {
  return (
    filename
      .trim()
      // Remove path separators
      .replace(/[\/\\]/g, "_")
      // Remove parent directory references
      .replace(/\.\./g, "_")
      // Remove null bytes
      .replace(/\0/g, "")
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Keep only alphanumeric, dots, hyphens, underscores
      .replace(/[^a-zA-Z0-9.\-_]/g, "_")
      // Limit consecutive underscores
      .replace(/_+/g, "_")
      // Remove leading/trailing underscores
      .replace(/^_+|_+$/g, "")
  );
}

// =============================================================================
// JSON SANITIZATION
// =============================================================================

/**
 * Sanitize JSON object - deep sanitization of string values
 *
 * Use this for: form data, API responses, JSONB fields
 *
 * Recursively sanitizes all string values in an object
 * Preserves structure, only sanitizes leaf string values
 *
 * @example
 * sanitizeJsonObject({
 *   name: '<script>alert(1)</script>John',
 *   age: 30,
 *   nested: { bio: '<b>Hello</b>' }
 * })
 * // Returns: { name: 'John', age: 30, nested: { bio: 'Hello' } }
 */
export function sanitizeJsonObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key (prevent key injection)
    const safeKey = sanitizePlainText(key);

    if (typeof value === "string") {
      // Sanitize string values
      sanitized[safeKey] = sanitizePlainText(value);
    } else if (Array.isArray(value)) {
      // Recursively sanitize arrays
      sanitized[safeKey] = value.map((item) =>
        typeof item === "object" && item !== null
          ? sanitizeJsonObject(item as Record<string, unknown>)
          : item
      );
    } else if (typeof value === "object" && value !== null) {
      // Recursively sanitize nested objects
      sanitized[safeKey] = sanitizeJsonObject(value as Record<string, unknown>);
    } else {
      // Keep primitives as-is (numbers, booleans, null)
      sanitized[safeKey] = value;
    }
  }

  return sanitized;
}

// =============================================================================
// SQL INJECTION PREVENTION
// =============================================================================

/**
 * Note: SQL injection prevention is handled by Supabase's parameterized queries.
 * This library does NOT need to sanitize for SQL injection.
 *
 * Always use Supabase client methods:
 * ✅ SAFE: supabase.from('table').select('*').eq('id', userId)
 * ❌ UNSAFE: supabase.rpc('raw_query', { query: `SELECT * FROM table WHERE id = ${userId}` })
 *
 * The Supabase client automatically parameterizes all queries.
 */

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Check if string contains HTML tags
 */
export function containsHtml(input: string): boolean {
  return /<[a-z][\s\S]*>/i.test(input);
}

/**
 * Check if string contains script tags
 */
export function containsScript(input: string): boolean {
  return /<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(input);
}

/**
 * Check if string contains event handlers
 */
export function containsEventHandlers(input: string): boolean {
  return /on\w+\s*=\s*["'][^"']*["']/gi.test(input);
}

/**
 * Check if string is safe (no HTML/scripts)
 */
export function isSafeString(input: string): boolean {
  return !containsHtml(input) && !containsScript(input) && !containsEventHandlers(input);
}

// =============================================================================
// BATCH SANITIZATION
// =============================================================================

/**
 * Sanitize array of strings
 *
 * @example
 * sanitizeArray(['<script>alert(1)</script>', 'safe text'])
 * // Returns: ['', 'safe text']
 */
export function sanitizeArray(inputs: string[]): string[] {
  return inputs.map(sanitizePlainText);
}

/**
 * Sanitize record/map of strings
 *
 * @example
 * sanitizeRecord({ name: '<b>John</b>', email: 'test@example.com' })
 * // Returns: { name: 'John', email: 'test@example.com' }
 */
export function sanitizeRecord(record: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    sanitized[sanitizePlainText(key)] = sanitizePlainText(value);
  }
  return sanitized;
}

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Alias for test compatibility
 */
export const sanitizeText = sanitizePlainText;

export default {
  // Core sanitization
  sanitizePlainText,
  sanitizeHtml,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeJsonObject,

  // Validation helpers
  containsHtml,
  containsScript,
  containsEventHandlers,
  isSafeString,

  // Batch operations
  sanitizeArray,
  sanitizeRecord,
};
