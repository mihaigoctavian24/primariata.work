# primariaTa❤️\_ - Claude Development Guide

## Project Context

**primariata.work** = SaaS platform pentru digitalizarea administrației publice locale din România

- **Type**: White-label multi-tenant platform
- **Users**: Cetățeni, Funcționari primării, Administratori
- **Core Feature**: Cereri online, plăți digitale, semnături electronice, notificări
- **Academic**: Proiect universitar URA - Programarea Aplicațiilor Web (2025-2026)
- **Team**: Octavian Mihai (Full-Stack) & Bianca-Maria Abbasi Pazeyazd (Frontend/UI/UX)

---

## Tech Stack Essentials

### Frontend

- **Next.js 15.5.9** (App Router, Server Components, Server Actions)
- **React 19** (functional components, hooks only)
- **TypeScript 5** (strict mode enabled)
- **Tailwind CSS 4** + shadcn/ui
- **Framer Motion 12** pentru animații
- **Zustand 5** pentru state management global
- **React Query 5** pentru server state
- **React Hook Form 7 + Zod 4** pentru forms & validation

### Backend

- **Supabase** (PostgreSQL 15, Auth, Storage, Realtime, Edge Functions)
- **Row Level Security (RLS)** pentru multi-tenancy (separare pe județ + localitate)
- **JWT Authentication** (Email + Google OAuth)
- **Edge Functions** (Deno runtime)

### Infrastructure

- **Vercel** (Frankfurt) pentru hosting
- **Cloudflare** pentru CDN, DNS, WAF, DDoS
- **Better Stack** pentru structured logging & monitoring
- **pnpm** pentru package management

---

## Development Commands

```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # Lint code
pnpm type-check       # TypeScript validation
pnpm test             # Unit tests (Jest)
pnpm test:integration # Integration tests
pnpm test:e2e         # E2E tests (Playwright)
pnpm types:generate   # Generate Supabase types
```

---

## Code Conventions

### TypeScript

**Prefer `interface` over `type` for object shapes:**

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
}

// ❌ Avoid
type User = {
  id: string;
  email: string;
};
```

**Use `unknown` over `any`:**

```typescript
// ✅ Good
function process(data: unknown) {
  if (typeof data === "string") {
    return data.toUpperCase();
  }
}

// ❌ Avoid
function process(data: any) {
  return data.toUpperCase(); // Unsafe
}
```

**Always type function returns explicitly:**

```typescript
// ✅ Good
async function fetchUser(id: string): Promise<User | null> {
  // ...
}

// ❌ Avoid - relies on inference
async function fetchUser(id: string) {
  // ...
}
```

### React Patterns

**Use Server Components by default, Client Components only when needed:**

```typescript
// ✅ Server Component (default) - no "use client"
export default async function UsersPage() {
  const users = await getUsers(); // Direct DB call
  return <UserList users={users} />;
}

// ✅ Client Component - interactive
'use client';
export function UserForm() {
  const [name, setName] = useState('');
  // ...
}
```

**Prefer Server Actions over API routes:**

```typescript
// ✅ Good - Server Action
'use server';
export async function createRequest(formData: FormData) {
  const supabase = await createClient();
  const result = await supabase.from('cereri').insert({...});
  revalidatePath('/cereri');
  return result;
}

// ❌ Avoid - unnecessary API route for simple mutations
// app/api/requests/route.ts
export async function POST(req: Request) { ... }
```

### Supabase Patterns

**Always use typed clients:**

```typescript
import { Database } from "@/types/database.types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient<Database>(url, key);

// ✅ Now fully typed
const { data } = await supabase.from("cereri").select("*"); // data is typed!
```

**Use correct client for each context:**

```typescript
// ✅ Server Components / Server Actions
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// ✅ Client Components
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// ✅ Middleware
import { createClient } from "@/lib/supabase/middleware";
const supabase = createClient(req);
```

**Rely on RLS, don't filter manually:**

```typescript
// ✅ Good - RLS handles filtering by județ/localitate
const { data } = await supabase.from("cereri").select("*");

// ❌ Avoid - manual filtering defeats RLS purpose
const { data } = await supabase.from("cereri").select("*").eq("judet_id", judetId); // RLS already does this!
```

### Forms & Validation

**Use React Hook Form + Zod schema:**

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email invalid"),
  password: z.string().min(8, "Minim 8 caractere"),
});

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  // ...
}
```

### Module System

**Named exports over default exports:**

```typescript
// ✅ Good - named exports
export function UserCard({ user }: Props) { ... }
export const userSchema = z.object({ ... });

// ❌ Avoid - default exports
export default function UserCard({ user }: Props) { ... }
```

**Prefer absolute imports with `@/` alias:**

```typescript
// ✅ Good
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

// ❌ Avoid - relative imports
import { Button } from "../../../components/ui/button";
```

### Async Patterns

**Prefer `Promise.all()` for parallel operations:**

```typescript
// ✅ Good - parallel
const [users, requests, payments] = await Promise.all([getUsers(), getRequests(), getPayments()]);

// ❌ Avoid - sequential when not needed
const users = await getUsers();
const requests = await getRequests();
const payments = await getPayments();
```

**Always handle promise rejections:**

```typescript
// ✅ Good
try {
  const result = await riskyOperation();
} catch (error) {
  console.error("Operation failed:", error);
  return { error: "A apărut o eroare" };
}

// ❌ Avoid - unhandled rejection
const result = await riskyOperation(); // Can crash!
```

---

## Multi-Tenancy Context

**Every table has județ_id + localitate_id:**

- RLS policies filter automatically based on user's location
- Location stored in user metadata during registration
- Never manually filter by location in queries (RLS handles it)

**Location Selection Flow:**

1. User visits landing page
2. Selects județ + localitate via LocationWheelPickerForm
3. Location stored in localStorage + Zustand
4. After auth, location stored in user metadata
5. RLS uses metadata to filter all queries

---

## Documentation References

- **README.md** - Quick start, project overview
- **ARCHITECTURE.md** - System design, data flow, tech stack details
- **DEVELOPMENT_GUIDE.md** - Daily workflows, common tasks
- **CONTRIBUTING.md** - Git workflow, PR process, code standards
- **.docs/** - Complete technical documentation (PRD, specs, roadmap)
- **docs/** - Official Romanian documentation (prezentare, cerințe, arhitectură)

---

## Common Pitfalls to Avoid

❌ **Don't use `any` type** - Use `unknown` or proper types
❌ **Don't bypass RLS** - Trust the security policies
❌ **Don't use default exports** - Makes refactoring harder
❌ **Don't create unnecessary API routes** - Use Server Actions
❌ **Don't use Client Components everywhere** - Default to Server Components
❌ **Don't forget to revalidate** - Call `revalidatePath()` after mutations
❌ **Don't ignore TypeScript errors** - Fix them, don't suppress with `@ts-ignore`
❌ **Don't skip error handling** - Always handle async errors
❌ **Don't hardcode strings** - Use constants or Zod schemas for validation messages

---

## Key Principles

1. **Type Safety First** - Leverage TypeScript strict mode fully
2. **Server-First Rendering** - Use Server Components by default
3. **Security Through RLS** - Trust Row Level Security policies
4. **Performance Matters** - Use React Query for caching, optimize images
5. **User Experience** - Romanian language, accessibility (WCAG 2.1 AA)
6. **Code Readability** - Self-documenting code > comments

---

**Note**: This guide complements the existing documentation. For architecture decisions and detailed specs, refer to ARCHITECTURE.md and .docs/ folder.
