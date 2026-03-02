# Coding Conventions

**Analysis Date:** 2026-03-02

## Naming Patterns

**Files:**

- Components: PascalCase (e.g., `LoginForm.tsx`, `DashboardLayout.tsx`)
- Utilities/Hooks: kebab-case for hooks with prefix (e.g., `use-cereri-list.ts`, `use-notifications-realtime.ts`)
- Libraries: kebab-case (e.g., `location-storage.ts`, `rate-limiter.ts`)
- API routes: kebab-case in segments (e.g., `/api/dashboard/search/cereri/route.ts`)
- Type files: types-first pattern (e.g., `database.types.ts`, `survey.ts`)

**Functions:**

- Async functions: use async/await syntax
- Handler functions: prefix with action name (e.g., `handleGoogleSignIn`, `handleSidebarToggle`)
- Utility/helper functions: descriptive verb-noun pattern (e.g., `formatCurrency`, `sanitizeJsonObject`, `extractKeyPhrases`)
- Factory/creator functions: use `create` prefix (e.g., `createClient`, `createServiceRoleClient`)

**Variables:**

- Boolean variables: use `is` or `has` prefix (e.g., `isLoading`, `isMobile`, `hasError`)
- State variables: descriptive camelCase (e.g., `sidebarOpen`, `selectedJudet`)
- Type/Interface instances: PascalCase for types, camelCase for instances (e.g., `interface User`, `const user`)
- Constants: UPPER_SNAKE_CASE (e.g., `CerereStatus.DEPUSA`, status enums)

**Types:**

- Interfaces: PascalCase with `I` prefix optional, but preferred without (e.g., `interface LoginFormProps`, `interface TextAnalysisInput`)
- Types: PascalCase (e.g., `type LoginFormValues`, `type CerereStatusType`)
- Enums: PascalCase (e.g., `CerereStatus` contains UPPER_SNAKE_CASE values)
- Extracted types: use `infer` from Zod schemas (e.g., `type LoginFormValues = z.infer<typeof loginSchema>`)

## Code Style

**Formatting:**

- Tool: Prettier v3.6.2
- Line length: 100 characters
- Indentation: 2 spaces
- Semicolons: true (always include)
- Trailing comma: es5 (trailing commas in objects/arrays, not in function parameters)
- Single quotes: false (use double quotes)
- Arrow function parens: always (e.g., `(value) => {}` not `value => {}`)
- Line endings: LF

**Linting:**

- Tool: ESLint 9.38.0 with Next.js config
- Extends: `next/core-web-vitals`, `next/typescript`, `prettier`
- Rules:
  - `prettier/prettier`: error
  - `@typescript-eslint/no-unused-vars`: warn (ignore variables starting with `_`)
  - `@typescript-eslint/no-explicit-any`: warn (discouraged but not forbidden)
  - `no-console`: warn (allow `console.warn` and `console.error`, block `console.log`)

## Import Organization

**Order:**

1. React/Next.js imports
2. Third-party library imports (Node modules)
3. Type imports from `@supabase/supabase-js` or custom types
4. Absolute imports from `@/` alias
5. Relative imports (rarely used, prefer absolute)

**Path Aliases:**

- `@/*` → `./src/*` (configured in `tsconfig.json`)

**Example:**

```typescript
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Database } from "@/types/database.types";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
```

## Error Handling

**Patterns:**

- Use try/catch for async operations that might fail
- Always provide meaningful error messages in Romanian for user-facing errors
- Log errors to console.error for debugging
- Return error objects instead of throwing in API routes (following Next.js pattern)
- Validate input with Zod before processing, let Zod handle validation errors

**Example:**

```typescript
try {
  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (signInError) {
    const errorMessage = signInError.message.includes("Invalid login credentials")
      ? "Email sau parolă greșită"
      : signInError.message;
    setError(errorMessage);
    return;
  }
} catch (err) {
  const errorMsg = "A apărut o eroare. Te rugăm să încerci din nou.";
  setError(errorMsg);
  console.error("Login error:", err);
}
```

## TypeScript Conventions

**Strict Mode Features:**

- `strict: true` enabled in `tsconfig.json`
- Additional strict checks: `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`

**Type Safety:**

- Prefer `interface` over `type` for object shapes: `interface User { id: string; email: string; }`
- Use `unknown` instead of `any`: ensures type narrowing before use
- Always explicitly type function returns: `async function fetchUser(id: string): Promise<User | null>`
- Never suppress errors with `@ts-ignore` or `@ts-nocheck` - fix the underlying issue instead
- Use `z.infer<typeof schema>` to extract types from Zod schemas rather than hand-writing them

**Database Types:**

- Generated from Supabase schema using `pnpm types:generate`
- File: `src/types/database.types.ts`
- Use generic parameter: `createClient<Database>` for fully typed queries

**Example:**

```typescript
// ✅ Good
async function fetchUser(id: string): Promise<User | null> {
  try {
    const { data } = await supabase.from("users").select("*").eq("id", id).single();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// ❌ Avoid
async function fetchUser(id: string) {
  // Missing return type
  const { data } = await supabase.from("users").select("*");
  return data; // type is 'any'
}
```

## React Patterns

**Server vs Client Components:**

- Default to Server Components (no `"use client"` directive)
- Use Client Components only when needed: state management, hooks, event handlers, real-time subscriptions
- Mark component with `"use client"` at the very top of the file

**Component Structure:**

```typescript
"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface ComponentProps {
  children: ReactNode;
  title: string;
}

export function Component({ children, title }: ComponentProps) {
  const [state, setState] = useState(false);

  return <div>{title}</div>;
}
```

**Hooks:**

- Export from `src/hooks/index.ts` via barrel file pattern
- Name with `use` prefix (e.g., `useCereriList`, `useNotificationsRealtime`)
- Always handle cleanup (return cleanup function from useEffect)
- Use dependency arrays correctly

**Function Components:**

- Use functional components with hooks (React 19 standard)
- Props interface named `{ComponentName}Props`
- Export as named export (not default)

**Example:**

```typescript
export function LoginForm({ redirectTo }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(values: LoginFormValues) {
    try {
      setIsLoading(true);
      // ... logic
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

## Supabase Patterns

**Client Selection:**

- **Server Components/Actions**: `import { createClient } from "@/lib/supabase/server"`
  - Use: `const supabase = await createClient()`
  - Returns typed client: `createClient<Database>()`

- **Client Components**: `import { createClient } from "@/lib/supabase/client"`
  - Use: `const supabase = createClient()`
  - Returns typed client: `createClient<Database>()`

- **Middleware**: `import { createClient } from "@/lib/supabase/middleware"`
  - Pass request: `const supabase = createClient(req)`

**RLS Trust Model:**

- Trust Row Level Security to filter data
- Do NOT manually filter by location (RLS policies handle it)
- RLS policies check `auth.jwt()` claims from user metadata

**Example:**

```typescript
// ✅ Good - RLS handles filtering automatically
const { data } = await supabase.from("cereri").select("*");

// ❌ Avoid - manual filtering defeats RLS
const { data } = await supabase.from("cereri").select("*").eq("judet_id", judetId); // RLS already does this filtering!
```

**Service Role Client:**

- Use `createServiceRoleClient()` only for:
  - Public data submission (surveys, contact forms)
  - Admin operations needing RLS bypass
  - Batch operations on behalf of system
- Never expose service role key to client side
- File: `src/lib/supabase/server.ts`

## Form & Validation Patterns

**Framework:**

- Library: React Hook Form 7.65.0 + Zod 4.1.12
- Always use `zodResolver` for validation

**Schema Structure:**

```typescript
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string().min(8, "Minim 8 caractere"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
```

**Form Component Pattern:**

```typescript
export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    // Handle submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

**Security Enhancements in Validation:**

- Use `createSafeStringSchema` for user input to sanitize XSS
- Validate JSONB size limits to prevent DoS attacks
- Refine validation with `.refine()` for custom rules
- Use `.transform()` to sanitize data before storing

**Example:**

```typescript
export const createCerereSchema = z.object({
  date_formular: z
    .record(z.string(), z.unknown())
    .refine((data) => JSON.stringify(data).length <= 100000, {
      message: "Datele formularului sunt prea mari",
    })
    .transform((data) => sanitizeJsonObject(data)),
});
```

## Module Design

**Exports:**

- Use named exports as default pattern
- Avoid default exports (harder to refactor)
- Group related exports logically

**Barrel Files:**

- Use `src/hooks/index.ts` to re-export all hooks
- Use `src/components/ui/index.ts` for shadcn components
- Simplifies imports: `import { Button, Input } from "@/components/ui"`

**Example:**

```typescript
// src/hooks/index.ts
export { useCereriList } from "./use-cereri-list";
export { useNotificationsRealtime } from "./use-notifications-realtime";
export { useTableState } from "./useTableState";
```

## Async Patterns

**Parallel Operations:**

- Use `Promise.all()` for concurrent operations that don't depend on each other
- Awaits all in parallel, faster than sequential

```typescript
// ✅ Good - parallel execution
const [users, requests, payments] = await Promise.all([getUsers(), getRequests(), getPayments()]);

// ❌ Avoid - sequential when not needed
const users = await getUsers();
const requests = await getRequests();
const payments = await getPayments();
```

**Server Actions:**

- Mark with `"use server"` at top of function
- Use in Client Components for mutations
- Return serializable data (no functions, Dates must be strings)

```typescript
"use server";
export async function createRequest(formData: FormData) {
  const supabase = await createClient();
  const result = await supabase.from("cereri").insert({...});
  revalidatePath("/cereri");
  return result;
}
```

## Logging

**Framework:** Console API (native)

**Patterns:**

- Use `console.error()` for errors (only logs enabled in prod)
- Use `console.warn()` for warnings
- Avoid `console.log()` (linter warns)
- Always include context: `console.error("Operation failed:", error)`
- Never log sensitive data (passwords, tokens, PII)

**Example:**

```typescript
try {
  await riskyOperation();
} catch (error) {
  console.error("Cerere submission failed:", error);
  return { error: "Nu am putut depune cererea" };
}
```

## Comments

**When to Comment:**

- Explain WHY, not WHAT (code already shows what)
- Document complex algorithms or non-obvious logic
- Flag temporary workarounds: `// TODO: Replace with better approach`
- Security/safety critical sections: `// SECURITY: This prevents XSS`

**JSDoc/TSDoc:**

- Document exported functions with JSDoc blocks
- Include `@param`, `@returns`, `@example` for public APIs
- Not required for private/internal functions

**Example:**

```typescript
/**
 * Fetch cereri list with optional filtering
 *
 * @param judetId - Filter by județ ID (optional)
 * @param limit - Maximum number of results (default: 20)
 * @returns Paginated cereri list
 *
 * @example
 * const { data } = await fetchCereri('AB', 50);
 */
export async function fetchCereri(judetId?: string, limit: number = 20): Promise<Cerere[]> {
  // Implementation
}
```

## Function Design

**Size:**

- Keep functions under 50 lines when possible
- Extract helper functions if logic is complex
- One responsibility per function (single responsibility principle)

**Parameters:**

- Limit to 3-4 parameters
- Use object parameter for 3+ related values
- Use optional chaining for optional properties

```typescript
// ✅ Good - use object for multiple related params
function formatDate(date: Date, options: { locale?: string; format?: string }) {
  // ...
}

// ❌ Avoid - too many parameters
function formatDate(
  date: Date,
  locale: string,
  format: string,
  timezone: string,
  includeTime: boolean
) {
  // ...
}
```

**Return Values:**

- Explicitly type returns
- Use nullable types for optional returns: `Promise<User | null>`
- Return early to reduce nesting
- Use error-first pattern for operations that can fail

```typescript
// ✅ Good - early return, explicit typing
async function getUser(id: string): Promise<User | null> {
  if (!id) return null;

  const { data } = await supabase.from("users").select("*").eq("id", id).single();

  return data || null;
}
```

## API Routes

**Location:** `src/app/api/[segment]/route.ts`

**Pattern:**

- Named exports for HTTP methods: `export async function GET(req: Request)`
- Return `Response` objects or use `NextResponse`
- Always validate input with Zod before processing
- Use RLS or authorization checks for security
- Return consistent error format

**Example:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = querySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cereri")
      .select("*")
      .limit(parseInt(query.limit || "20"));

    if (error) {
      return NextResponse.json({ error: "Failed to fetch cereri" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

---

_Convention analysis: 2026-03-02_
