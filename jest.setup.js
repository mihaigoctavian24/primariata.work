// Jest setup file for global test configuration
import "@testing-library/jest-dom";

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key";
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "mock-openai-key";

// Mock fetch globally for OpenAI client
global.fetch = jest.fn();

// Mock TextEncoder/TextDecoder for Node.js environment
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Web APIs for Next.js Edge Runtime testing
// These are minimal implementations to satisfy Next.js imports
if (typeof global.Request === "undefined") {
  global.Request = class Request {
    constructor(url, options = {}) {
      this._url = url;
      this.method = options.method || "GET";
      this.headers = new global.Headers(options.headers || {});
      this.body = options.body || null;
    }

    // url must be a getter to match NextRequest behavior
    get url() {
      return this._url;
    }

    // json() method to parse request body
    async json() {
      if (typeof this.body === "string") {
        return JSON.parse(this.body);
      }
      return this.body;
    }

    // text() method to get request body as text
    async text() {
      if (typeof this.body === "string") {
        return this.body;
      }
      return JSON.stringify(this.body);
    }
  };
}

if (typeof global.Response === "undefined") {
  global.Response = class Response {
    constructor(body, options = {}) {
      this.body = body;
      this.status = options.status || 200;
      this.statusText = options.statusText || "OK";
      // headers must be a Headers object with .get() method
      this.headers = new global.Headers(options.headers || {});
      this.ok = this.status >= 200 && this.status < 300;
    }

    static json(data, options) {
      return new Response(JSON.stringify(data), {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });
    }

    async json() {
      if (typeof this.body === "string") {
        return JSON.parse(this.body);
      }
      return this.body;
    }

    async text() {
      if (typeof this.body === "string") {
        return this.body;
      }
      return JSON.stringify(this.body);
    }

    async arrayBuffer() {
      const text = await this.text();
      return new TextEncoder().encode(text).buffer;
    }
  };
}

if (typeof global.Headers === "undefined") {
  global.Headers = class Headers extends Map {
    constructor(init) {
      super();
      if (init) {
        if (init instanceof Headers || init instanceof Map) {
          for (const [key, value] of init.entries()) {
            this.set(key, value);
          }
        } else if (typeof init === "object") {
          for (const [key, value] of Object.entries(init)) {
            this.set(key, value);
          }
        }
      }
    }

    append(key, value) {
      const existing = this.get(key.toLowerCase());
      if (existing) {
        this.set(key.toLowerCase(), `${existing}, ${value}`);
      } else {
        this.set(key.toLowerCase(), value);
      }
    }

    get(key) {
      return super.get(key.toLowerCase());
    }

    has(key) {
      return super.has(key.toLowerCase());
    }

    set(key, value) {
      super.set(key.toLowerCase(), String(value));
    }

    delete(key) {
      super.delete(key.toLowerCase());
    }
  };
}

if (typeof global.FormData === "undefined") {
  global.FormData = class FormData extends Map {};
}

// Mock Blob for PDF/Excel exports
if (typeof global.Blob === "undefined") {
  global.Blob = class Blob {
    constructor(parts, options) {
      this.parts = parts || [];
      this.options = options || {};
    }

    async arrayBuffer() {
      // Handle Uint8Array and other typed arrays
      if (this.parts.length === 1 && this.parts[0] instanceof Uint8Array) {
        return this.parts[0].buffer;
      }
      // Handle string parts
      const text = this.parts.join("");
      return new TextEncoder().encode(text).buffer;
    }

    async text() {
      // Handle Uint8Array and other typed arrays
      if (this.parts.length === 1 && this.parts[0] instanceof Uint8Array) {
        return new TextDecoder().decode(this.parts[0]);
      }
      return this.parts.join("");
    }
  };
}
