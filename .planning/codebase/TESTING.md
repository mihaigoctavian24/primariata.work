# Testing Patterns

**Analysis Date:** 2026-03-02

## Test Framework

**Runner:**

- Jest 30.2.0
- Config: `jest.config.js`
- Environment: `jest-environment-jsdom`

**Assertion Library:**

- Jest built-in matchers (`expect()`)
- Testing Library 16.3.0 for React component testing
- Testing Library jest-dom 6.9.1 for DOM matchers

**E2E Framework:**

- Playwright 1.56.1
- Config: `playwright.config.ts`
- Runs against live server or production URL

**Run Commands:**

```bash
pnpm test              # Run all Jest tests
pnpm test:watch       # Watch mode for development
pnpm test:coverage    # Generate coverage report
pnpm test:ci          # CI mode (coverage, fail on console.log)
pnpm test:integration # Run integration tests only (jest.integration.config.js)
pnpm test:e2e         # Run Playwright E2E tests
pnpm test:e2e:ui      # E2E tests with UI for debugging
pnpm test:e2e:headed  # E2E tests in headed browser
pnpm test:e2e:debug   # Single-step debugging mode
pnpm test:e2e:smoke   # Run tests tagged with @smoke
pnpm test:all         # Run all tests: jest + e2e
```

## Test File Organization

**Location:**

- Unit tests: co-located with source code
  - Pattern: `src/lib/**/__tests__/file.test.ts`
  - Pattern: `src/components/**/__tests__/component.test.tsx`
- Integration tests: `tests/integration/**/*.test.ts`
- E2E tests: `e2e/**/*.spec.ts`

**Naming:**

- Unit/Integration: `*.test.ts` or `*.test.tsx`
- E2E: `*.spec.ts` (Playwright convention)
- Mock files: `__mocks__/file.ts`

**Structure Example:**

```
src/lib/ai/
├── text-analyzer.ts
├── __tests__/
│   ├── text-analyzer.test.ts
│   ├── cohort-analyzer.test.ts
│   └── ...
└── __mocks__/
    └── openai-client.ts

tests/integration/
├── api/
│   ├── judete.test.ts
│   ├── localitati.test.ts
│   └── plati.test.ts
├── rls/
│   └── user-invitations.test.ts
└── security-integration.test.ts

e2e/
├── homepage.spec.ts
├── cereri-flow.spec.ts
├── admin-dashboard.spec.ts
└── role-based-dashboard.spec.ts
```

## Test Structure

**Suite Organization:**

```typescript
describe("Text Analyzer Service", () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    jest.restoreAllMocks();
  });

  describe("analyzeTextResponses", () => {
    it("should analyze text responses successfully", async () => {
      // Arrange
      const validInput: TextAnalysisInput = {
        questionId: "q5_suggestions",
        questionText: "Ce îmbunătățiri sugerați?",
        respondentType: "citizen",
        responses: ["Response 1", "Response 2"],
      };

      // Act
      const result = await analyzeTextResponses(validInput);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it("should handle empty responses array", async () => {
      const emptyInput: TextAnalysisInput = {
        ...validInput,
        responses: [],
      };

      const result = await analyzeTextResponses(emptyInput);

      expect(result.themes).toEqual([]);
      expect(result.sentiment.label).toBe("neutral");
    });
  });
});
```

**Patterns:**

- AAA Pattern: Arrange, Act, Assert
- One `expect` per test (when possible) for clarity
- Descriptive test names starting with "should"
- Group related tests with `describe()` blocks
- Use `beforeEach()` and `afterEach()` for setup/teardown

## Mocking

**Framework:** Jest built-in mocking

**Patterns:**

1. **Mock External Services:**

```typescript
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({
    data: mockJudete,
    error: null,
  }),
};

(createClient as jest.Mock).mockResolvedValue(mockSupabase);
```

2. **Mock OpenAI/External APIs:**

```typescript
jest.mock("@/lib/ai/openai-client", () => ({
  chatCompletion: jest.fn(),
}));

const mockChatCompletion = chatCompletion as jest.MockedFunction<typeof chatCompletion>;

mockChatCompletion.mockResolvedValueOnce({
  content: JSON.stringify(mockResponse),
  usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
  model: "gpt-4o-mini",
  finishReason: "stop",
});
```

3. **Mock Next.js APIs:**

```typescript
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    setAll: jest.fn(),
  })),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));
```

**What to Mock:**

- External APIs (Supabase, OpenAI, payment services)
- File system operations
- Network requests
- Next.js routing/navigation
- Environment variables

**What NOT to Mock:**

- Pure utility functions (formatCurrency, cn(), etc.)
- Zod validation (test real validation)
- Business logic (test actual behavior)
- React components used as children (unless testing parents)

## Fixtures and Factories

**Test Data:**

```typescript
// Define reusable test data
const validInput: TextAnalysisInput = {
  questionId: "q5_suggestions",
  questionText: "Ce îmbunătățiri sugerați?",
  respondentType: "citizen",
  responses: [
    "Plăți online ar fi foarte utile",
    "Mai multe notificări prin email",
    "Interfață mai simplă pentru seniori",
  ],
};

const mockResponse = {
  themes: [
    {
      name: "Plăți digitale",
      score: 0.8,
      mentions: 1,
      keywords: ["plăți", "online"],
      sentiment: 0.7,
    },
  ],
  sentiment: {
    overall: 0.5,
    label: "positive" as const,
    distribution: { positive: 60, neutral: 30, negative: 10 },
    confidence: 0.85,
  },
  keyPhrases: ["Plăți online", "notificări email"],
  topQuotes: ["Plăți online ar fi foarte utile"],
  summary: "Cetățenii doresc mai multe funcționalități digitale.",
  wordFrequency: [
    { word: "plăți", count: 3 },
    { word: "online", count: 2 },
  ],
};
```

**Location:**

- Keep fixtures in test files if simple (< 20 lines)
- Create `fixtures/` directory for complex shared test data
- Use TypeScript interfaces to ensure type safety

## Coverage

**Requirements:** No enforced minimum coverage (set to 0 in `jest.config.js`)

**View Coverage:**

```bash
pnpm test:coverage
# Report generated in coverage/ directory
```

**Coverage Configuration:**

- Include: `src/**/*.{js,jsx,ts,tsx}`
- Exclude: `**/*.d.ts`, `**/*.stories.{js,jsx,ts,tsx}`, `__tests__` directories
- Reporters: html, text-summary

**Best Practices:**

- Focus on critical paths, not 100% coverage
- Test error cases and edge conditions
- Test user-facing behavior, not implementation details
- Integration tests cover more than unit tests

## Test Types

### Unit Tests

**Scope:**

- Test single functions/components in isolation
- Mock all external dependencies
- Fast execution (< 100ms per test)
- File: `src/lib/**/__tests__/*.test.ts`

**Example - Utility Function:**

```typescript
describe("calculateWordFrequency", () => {
  it("should calculate word frequency correctly", () => {
    const texts = [
      "Serviciile digitale sunt importante",
      "Digitalizarea serviciilor publice este importantă",
      "Servicii online rapide",
    ];

    const result = calculateWordFrequency(texts, 10);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("word");
    expect(result[0]).toHaveProperty("count");
  });

  it("should exclude Romanian stop words", () => {
    const texts = ["și de la în cu pentru pe"];
    const result = calculateWordFrequency(texts);

    expect(result).toEqual([]);
  });
});
```

### Integration Tests

**Scope:**

- Test multiple units working together
- Mock external services (Supabase) but test logic flow
- File: `tests/integration/**/*.test.ts`

**Example - API Route:**

```typescript
describe("GET /api/localitati/judete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockJudete,
        error: null,
      }),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it("should return 42 județe", async () => {
    const response = await GET();
    const json = await response.json();
    const data = json as ApiResponse<Judet[]>;

    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(42);
  });

  it("should return județe sorted alphabetically", async () => {
    const response = await GET();
    const json = await response.json();
    const data = json as ApiResponse<Judet[]>;
    const names = data.data.map((j) => j.nume);

    const albaIndex = names.indexOf("Alba");
    const aradIndex = names.indexOf("Arad");
    expect(albaIndex).toBeLessThan(aradIndex);
  });
});
```

### E2E Tests (Playwright)

**Scope:**

- Test complete user journeys
- No mocking (tests against real server)
- Browser-based testing
- Slower but tests real behavior
- File: `e2e/**/*.spec.ts`

**Configuration:**

- Multiple browser testing: Chromium, Firefox, WebKit
- Mobile testing: Pixel 5, iPhone 12
- Tablet testing: iPad Pro
- Locale: ro-RO (Romanian)
- Timezone: Europe/Bucharest
- Screenshots/videos on failure

**Example:**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load successfully @smoke", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(/primariaTa/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("should have no accessibility violations @smoke", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Check alt text on images
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      expect(alt).toBeDefined();
    }

    // Check heading hierarchy
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(1);
  });

  test("should load without console errors @smoke", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(consoleErrors).toHaveLength(0);
  });
});
```

**Test Tags:**

- `@smoke` - Critical smoke tests for production (fast, important)
- Regular tests without tags run in full test suite
- Filter by tag: `pnpm test:e2e:smoke`

**Global Setup:**

- File: `e2e/global-setup.ts`
- Runs once before all E2E tests
- Can set up test data, login sessions, etc.

## Common Patterns

### Async Testing

```typescript
// With async/await
it("should analyze text responses successfully", async () => {
  const result = await analyzeTextResponses(validInput);
  expect(result).toEqual(mockResponse);
});

// With Promise return
it("should analyze text responses", () => {
  return analyzeTextResponses(validInput).then((result) => {
    expect(result).toEqual(mockResponse);
  });
});

// With done callback (not preferred - use async)
it("should work with callback", (done) => {
  analyzeTextResponses(validInput).then(() => {
    expect(true).toBe(true);
    done();
  });
});
```

### Error Testing

```typescript
it("should handle sentiment detection errors", async () => {
  mockChatCompletion.mockRejectedValueOnce(new Error("API Error"));

  const result = await detectSentiment("Some text");

  expect(result.overall).toBe(0);
  expect(result.label).toBe("neutral");
  expect(result.confidence).toBe(0);
});

it("should handle API errors gracefully", async () => {
  mockChatCompletion.mockRejectedValueOnce(new Error("API Error"));

  const result = await analyzeTextResponses(validInput);

  expect(result.themes).toEqual([]);
  expect(result.sentiment.label).toBe("neutral");
  expect(result.summary).toContain("eșuat");
});
```

### Testing Edge Cases

```typescript
it("should filter out empty strings from responses", async () => {
  const inputWithEmptyStrings: TextAnalysisInput = {
    ...validInput,
    responses: ["Valid response", "", "   ", "Another valid response"],
  };

  mockChatCompletion.mockResolvedValueOnce({
    content: JSON.stringify({...}),
    usage: { promptTokens: 50, completionTokens: 25, totalTokens: 75 },
    model: "gpt-4o-mini",
    finishReason: "stop",
  });

  await analyzeTextResponses(inputWithEmptyStrings);

  expect(mockChatCompletion).toHaveBeenCalledWith(
    expect.objectContaining({
      userPrompt: expect.not.stringContaining('""'),
    })
  );
});

it("should limit topQuotes to 5 items", async () => {
  const mockResponseWithManyQuotes = {
    themes: [],
    sentiment: { overall: 0, label: "neutral", distribution: {}, confidence: 0.7 },
    keyPhrases: [],
    topQuotes: Array(10).fill("quote"),
    summary: "Test",
    wordFrequency: [],
  };

  mockChatCompletion.mockResolvedValueOnce({
    content: JSON.stringify(mockResponseWithManyQuotes),
    usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    model: "gpt-4o-mini",
    finishReason: "stop",
  });

  const result = await analyzeTextResponses(validInput);

  expect(result.topQuotes.length).toBe(5);
});
```

### Testing React Components

```typescript
import { render, screen } from "@testing-library/react";
import { LoginForm } from "@/components/auth/LoginForm";

describe("LoginForm", () => {
  it("should render email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parolă/i)).toBeInTheDocument();
  });

  it("should display error message on failed login", async () => {
    render(<LoginForm onError={() => {}} />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /intră în cont/i });

    // Type invalid credentials
    await userEvent.type(emailInput, "test@test.com");
    await userEvent.click(submitButton);

    // Wait for error message
    await screen.findByText(/email sau parolă greșită/i);
  });
});
```

## Jest Setup

**File:** `jest.setup.js`

**Features:**

- Loads environment variables from `.env.local`
- Imports Testing Library jest-dom matchers
- Mocks global browser APIs (Request, Response, Headers, FormData, Blob)
- Mocks TextEncoder/TextDecoder for Node.js environment
- Sets up default environment variables for tests

**Key Environment Variables:**

```javascript
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role-key";
process.env.OPENAI_API_KEY = "mock-openai-key";
```

## CI Testing

**Command:**

```bash
pnpm test:ci
# Runs: jest --ci --coverage --maxWorkers=2 --passWithNoTests
```

**Behavior:**

- Runs with coverage reporting
- Limited to 2 workers (resource-constrained CI)
- Passes even if no tests found (useful for test folders)
- Fails on console.log (enforces clean logging)

**Playwright in CI:**

- Config: `playwright.config.ts` detects CI via `process.env.CI`
- Retries: 2 retries in CI (1 locally)
- Reporters: HTML report, JSON output, GitHub annotations
- Workers: 2 (default in CI)
- Screenshot/video: retained on failures only

---

_Testing analysis: 2026-03-02_
