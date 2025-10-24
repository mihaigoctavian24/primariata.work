# Development Guide - primariaTa❤️\_

<div align="center">

**Practical Developer's Handbook**

Step-by-step guides for common development tasks, from setup to deployment

[Quick Start](#quick-start) • [Common Tasks](#common-tasks) • [Database](#database-management) • [Testing](#testing-guide) • [Troubleshooting](#troubleshooting)

</div>

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure Explained](#project-structure-explained)
- [Common Development Tasks](#common-development-tasks)
  - [Adding a New Page](#adding-a-new-page)
  - [Creating a Component](#creating-a-component)
  - [Adding an API Endpoint](#adding-an-api-endpoint)
  - [Creating a Database Migration](#creating-a-database-migration)
  - [Adding a New Form](#adding-a-new-form)
  - [Implementing Authentication](#implementing-authentication)
- [Database Management](#database-management)
- [Testing Guide](#testing-guide)
- [Debugging Techniques](#debugging-techniques)
- [Performance Optimization](#performance-optimization)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)
- [FAQ](#frequently-asked-questions)

---

## Quick Start

### First-Time Setup

```bash
# 1. Clone repository
git clone https://github.com/mihaigoctavian24/primariata.work.git
cd primariata.work

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Install Playwright browsers
pnpm playwright:install

# 5. Start development server
pnpm dev

# ✅ Open http://localhost:3000
```

### Daily Development Workflow

```bash
# 1. Pull latest changes
git checkout develop
git pull upstream develop

# 2. Create feature branch
git checkout -b feature/your-feature

# 3. Start dev server
pnpm dev

# 4. Make changes, test locally
pnpm type-check  # Check TypeScript
pnpm lint        # Check code style
pnpm test        # Run unit tests

# 5. Commit changes (triggers git hooks)
git add .
git commit -m "feat(scope): description"

# 6. Push and create PR
git push origin feature/your-feature
# Then create PR on GitHub
```

---

## Project Structure Explained

### Key Directories

```
primariata.work/
├── src/                        # Application source code
│   ├── app/                    # Next.js App Router (routes)
│   │   ├── layout.tsx          # Root layout (providers, fonts, metadata)
│   │   ├── page.tsx            # Landing page (/)
│   │   ├── error.tsx           # Error boundary for this route group
│   │   └── global-error.tsx    # Global error handler
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components (shadcn/ui)
│   │   ├── auth/               # Authentication components
│   │   ├── cereri/             # Request management
│   │   └── shared/             # Shared/common components
│   │
│   ├── lib/                    # Core utilities
│   │   ├── supabase/           # Supabase client configurations
│   │   ├── validations/        # Zod schemas
│   │   └── utils/              # Helper functions
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand state stores
│   └── types/                  # TypeScript type definitions
│
├── supabase/                   # Supabase configuration
│   ├── migrations/             # Database migrations
│   └── functions/              # Edge Functions
│
├── tests/                      # Test suites
│   ├── unit/                   # Jest unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # Playwright E2E tests
│
└── public/                     # Static assets
```

### Configuration Files

| File                   | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `package.json`         | Dependencies, scripts, project metadata |
| `tsconfig.json`        | TypeScript compiler configuration       |
| `next.config.ts`       | Next.js configuration + Sentry          |
| `tailwind.config.ts`   | Tailwind CSS theme customization        |
| `eslint.config.mjs`    | ESLint rules (Next.js + Prettier)       |
| `prettier.config.js`   | Code formatting rules                   |
| `playwright.config.ts` | E2E test configuration                  |
| `jest.config.js`       | Unit test configuration                 |
| `commitlint.config.js` | Commit message validation               |

---

## Common Development Tasks

### Adding a New Page

**Scenario**: Create a new page at `/dashboard/cereri`

**Steps:**

1. **Create page file**:

```bash
# File: src/app/dashboard/cereri/page.tsx
```

2. **Implement Server Component** (data fetching):

```typescript
// src/app/dashboard/cereri/page.tsx
import { createClient } from '@/lib/supabase/server';
import { RequestList } from '@/components/cereri/request-list';

export const metadata = {
  title: 'Cererile Mele | primariaTa',
  description: 'Vizualizează și gestionează cererile tale',
};

export default async function CereriPage() {
  const supabase = createClient();

  // Fetch requests (RLS automatically filters by user)
  const { data: requests, error } = await supabase
    .from('cereri')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to load requests');
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Cererile Mele</h1>
      <RequestList requests={requests} />
    </div>
  );
}
```

3. **Add to navigation**:

```typescript
// src/components/shared/sidebar.tsx
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/dashboard/cereri", label: "Cereri", icon: FileTextIcon }, // ← Add this
  { href: "/dashboard/plati", label: "Plăți", icon: CreditCardIcon },
];
```

4. **Test the page**:

```bash
pnpm dev
# Visit http://localhost:3000/dashboard/cereri
```

---

### Creating a Component

**Scenario**: Create a reusable `StatusBadge` component

**Steps:**

1. **Create component file**:

```bash
# File: src/components/ui/status-badge.tsx
```

2. **Implement component**:

```typescript
// src/components/ui/status-badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      status: {
        draft: 'bg-gray-100 text-gray-800',
        submitted: 'bg-blue-100 text-blue-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: {
      status: 'draft',
    },
  }
);

export interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  className?: string;
  children: React.ReactNode;
}

export function StatusBadge({ status, className, children }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      {children}
    </span>
  );
}
```

3. **Create tests**:

```typescript
// src/components/ui/__tests__/status-badge.test.tsx
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../status-badge';

describe('StatusBadge', () => {
  it('renders children correctly', () => {
    render(<StatusBadge status="approved">Approved</StatusBadge>);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    render(<StatusBadge status="approved">Approved</StatusBadge>);
    expect(screen.getByText('Approved')).toHaveClass('bg-green-100', 'text-green-800');
  });
});
```

4. **Use component**:

```typescript
// Usage in other components
import { StatusBadge } from '@/components/ui/status-badge';

<StatusBadge status="approved">Aprobat</StatusBadge>
```

---

### Adding an API Endpoint

**Scenario**: Create API endpoint for creating a request

**Steps:**

1. **Create Route Handler**:

```bash
# File: src/app/api/cereri/route.ts
```

2. **Implement POST handler**:

```typescript
// src/app/api/cereri/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cerereSchema } from "@/lib/validations/cereri";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await req.json();
    const validatedData = cerereSchema.parse(body);

    // 2. Get authenticated user
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Insert into database (RLS applies automatically)
    const { data: cerere, error: dbError } = await supabase
      .from("cereri")
      .insert({
        user_id: user.id,
        type: validatedData.type,
        status: "draft",
        data: validatedData.data,
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    // 4. Return success response
    return NextResponse.json(
      {
        success: true,
        data: cerere,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating cerere:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET handler for listing requests
export async function GET(req: NextRequest) {
  const supabase = createClient();

  const { data: cereri, error } = await supabase
    .from("cereri")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: cereri });
}
```

3. **Create validation schema**:

```typescript
// src/lib/validations/cereri.ts
import { z } from "zod";

export const cerereSchema = z.object({
  type: z.enum(["certificat_nastere", "certificat_casatorie", "autorizatie_construire"]),
  data: z.object({
    nume: z.string().min(2).max(100),
    prenume: z.string().min(2).max(100),
    cnp: z.string().length(13),
    adresa: z.string().min(10).max(500),
    // ... other fields
  }),
});

export type CerereInput = z.infer<typeof cerereSchema>;
```

4. **Use from client**:

```typescript
// Client-side usage
"use client";

async function createCerere(data: CerereInput) {
  const response = await fetch("/api/cereri", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create cerere");
  }

  return response.json();
}
```

---

### Creating a Database Migration

**Scenario**: Add `phone_number` field to `users` table

**Steps:**

1. **Create migration file**:

```bash
# Generate timestamp-based migration file
supabase migration new add_phone_number_to_users

# Creates: supabase/migrations/20250118120000_add_phone_number_to_users.sql
```

2. **Write migration SQL**:

```sql
-- supabase/migrations/20250118120000_add_phone_number_to_users.sql

-- Add phone_number column
ALTER TABLE auth.users
ADD COLUMN phone_number text;

-- Add validation constraint (Romanian phone format)
ALTER TABLE auth.users
ADD CONSTRAINT phone_number_format
CHECK (phone_number IS NULL OR phone_number ~ '^\+40[0-9]{9}$');

-- Create index for phone lookups
CREATE INDEX idx_users_phone_number ON auth.users(phone_number);

-- Add comment
COMMENT ON COLUMN auth.users.phone_number IS 'Romanian phone number in +40XXXXXXXXX format';
```

3. **Test migration locally**:

```bash
# Reset local database
supabase db reset

# Apply migrations
supabase db push

# Verify migration
supabase db diff
```

4. **Update TypeScript types**:

```bash
# Regenerate types from database
pnpm types:generate
```

5. **Use new field**:

```typescript
// Now TypeScript knows about phone_number
const { data: user } = await supabase.from("users").select("id, email, phone_number").single();

// Type-safe!
console.log(user.phone_number); // string | null
```

---

### Adding a New Form

**Scenario**: Create a contact form with validation

**Steps:**

1. **Create Zod schema**:

```typescript
// src/lib/validations/contact.ts
import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă minim 2 caractere"),
  email: z.string().email("Email invalid"),
  phone: z.string().regex(/^\+40[0-9]{9}$/, "Telefon invalid (format: +40XXXXXXXXX)"),
  subject: z.string().min(5, "Subiectul trebuie să aibă minim 5 caractere"),
  message: z.string().min(20, "Mesajul trebuie să aibă minim 20 caractere"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
```

2. **Create form component**:

```typescript
// src/components/forms/contact-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { contactFormSchema, type ContactFormData } from '@/lib/validations/contact';
import { toast } from 'sonner';

export function ContactForm() {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(data: ContactFormData) {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      toast.success('Mesajul a fost trimis cu succes!');
      form.reset();
    } catch (error) {
      toast.error('Eroare la trimiterea mesajului. Te rugăm să încerci din nou.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nume complet</FormLabel>
              <FormControl>
                <Input placeholder="Ion Popescu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ion.popescu@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefon</FormLabel>
              <FormControl>
                <Input placeholder="+40700000000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subiect</FormLabel>
              <FormControl>
                <Input placeholder="Întrebare despre..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mesaj</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Scrie mesajul tău aici..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Se trimite...' : 'Trimite mesaj'}
        </Button>
      </form>
    </Form>
  );
}
```

3. **Test form validation**:

```typescript
// src/components/forms/__tests__/contact-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '../contact-form';

describe('ContactForm', () => {
  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: /trimite/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/numele trebuie/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /trimite/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email invalid/i)).toBeInTheDocument();
    });
  });
});
```

---

### Implementing Authentication

**Scenario**: Add authentication to a page

**Steps:**

1. **Create auth hook**:

```typescript
// src/hooks/use-auth.ts
"use client";

import { useEffect, useState } from "use";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
```

2. **Protect a page** (middleware):

```typescript
// src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

3. **Login component**:

```typescript
// src/components/auth/login-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success('Autentificare reușită!');
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Parolă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Se autentifică...' : 'Autentificare'}
      </Button>
    </form>
  );
}
```

---

## Database Management

### Supabase CLI Commands

```bash
# Start local Supabase (Docker required)
supabase start

# Stop local Supabase
supabase stop

# Link to remote project
supabase link --project-ref ihwfqsongyaahdtypgnh

# Create new migration
supabase migration new migration_name

# Apply migrations to local
supabase db reset

# Apply migrations to remote
supabase db push

# Pull remote schema
supabase db pull

# Generate TypeScript types
pnpm types:generate

# View database diff
supabase db diff
```

### Common SQL Patterns

**Create table with RLS:**

```sql
-- Create table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cerere_id uuid REFERENCES cereri(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users see only their documents
CREATE POLICY "users_see_own_documents"
ON documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cereri
    WHERE cereri.id = documents.cerere_id
    AND cereri.user_id = auth.uid()
  )
);

-- Policy: Users can upload documents
CREATE POLICY "users_upload_documents"
ON documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM cereri
    WHERE cereri.id = documents.cerere_id
    AND cereri.user_id = auth.uid()
  )
);
```

**Query with joins:**

```typescript
const { data } = await supabase
  .from("cereri")
  .select(
    `
    *,
    documents(*),
    user:users(email, full_name)
  `
  )
  .eq("status", "submitted")
  .order("created_at", { ascending: false });
```

---

## Testing Guide

### Unit Tests (Jest)

**Run tests:**

```bash
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report
```

**Testing a component:**

```typescript
// components/ui/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### E2E Tests (Playwright)

**Run tests:**

```bash
pnpm test:e2e              # All browsers
pnpm test:e2e:chromium     # Chromium only
pnpm test:e2e:ui           # Interactive UI mode
pnpm test:e2e:debug        # Debug mode with inspector
```

**Writing E2E tests:**

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("successful login redirects to dashboard", async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // Fill form
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");

    // Submit
    await page.click('button[type="submit"]');

    // Verify redirect
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Welcome back")).toBeVisible();
  });

  test("invalid credentials show error", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "invalid@example.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Invalid credentials")).toBeVisible();
  });
});
```

---

## Debugging Techniques

### Next.js Debugging

**1. Console logging (server vs client):**

```typescript
// Server Component
export default async function Page() {
  console.log('SERVER:', data); // Logs in terminal
  return <div>...</div>;
}

// Client Component
'use client';
export function Component() {
  console.log('CLIENT:', data); // Logs in browser
  return <div>...</div>;
}
```

**2. VS Code debugging:**

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

**3. React DevTools:**

- Install React DevTools browser extension
- Inspect component tree
- View props/state
- Profile performance

### Database Debugging

**Check RLS policies:**

```sql
-- Disable RLS temporarily for debugging
ALTER TABLE cereri DISABLE ROW LEVEL SECURITY;

-- Test query
SELECT * FROM cereri;

-- Re-enable RLS
ALTER TABLE cereri ENABLE ROW LEVEL SECURITY;
```

**Query logging:**

```typescript
// Log all queries (development only)
const supabase = createClient();

supabase.from("cereri").select().then(console.log).catch(console.error);
```

---

## Performance Optimization

### Image Optimization

**Use Next.js Image component:**

```typescript
import Image from 'next/image';

// ✅ Good - Automatic optimization
<Image
  src="/logo.png"
  alt="primariaTa Logo"
  width={200}
  height={100}
  priority // For LCP images
/>

// ❌ Avoid - No optimization
<img src="/logo.png" alt="Logo" />
```

### Code Splitting

**Dynamic imports:**

```typescript
import dynamic from 'next/dynamic';

// Load component only when needed
const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // Client-side only
});

export function Dashboard() {
  return (
    <div>
      <HeavyChart data={chartData} />
    </div>
  );
}
```

### Database Query Optimization

**Use indexes:**

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- Add indexes for common queries
CREATE INDEX idx_cereri_status_created ON cereri(status, created_at DESC);
```

**Optimize RLS:**

```sql
-- Use indexes in RLS policies
CREATE INDEX idx_cereri_user_id ON cereri(user_id);

CREATE POLICY "user_owns_cerere"
ON cereri FOR SELECT
USING (user_id = auth.uid()); -- Uses index
```

---

## Deployment Guide

### Vercel Deployment

**1. Push to GitHub:**

```bash
git push origin main
# Vercel auto-deploys from main branch
```

**2. Manual deployment:**

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**3. Environment variables:**

- Add in Vercel Dashboard → Settings → Environment Variables
- Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database Migrations (Production)

```bash
# 1. Test locally first
supabase db reset
supabase db push

# 2. Apply to production
supabase db push --db-url postgresql://[connection-string]

# 3. Verify
supabase db diff --db-url postgresql://[connection-string]
```

---

## Troubleshooting

### Common Issues

**Problem**: `pnpm install` fails

**Solution:**

```bash
# Clear cache and retry
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

**Problem**: TypeScript errors after migration

**Solution:**

```bash
# Regenerate types
pnpm types:generate

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

**Problem**: Supabase connection error

**Solution:**

```bash
# Check .env.local has correct values
cat .env.local | grep SUPABASE

# Test connection
curl https://[project-id].supabase.co/rest/v1/
```

---

**Problem**: Playwright tests failing

**Solution:**

```bash
# Install/update browsers
pnpm playwright:install

# Run with UI to debug
pnpm test:e2e:ui
```

---

## Frequently Asked Questions

**Q: How do I add a new shadcn/ui component?**

```bash
npx shadcn@latest add [component-name]

# Example:
npx shadcn@latest add dropdown-menu
```

---

**Q: How do I handle file uploads?**

See [Document Upload Flow](ARCHITECTURE.md#document-upload-flow) in Architecture guide.

---

**Q: How do I implement real-time features?**

```typescript
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Subscribe to changes
const channel = supabase
  .channel("cereri-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "cereri",
    },
    (payload) => {
      console.log("Change received!", payload);
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

---

**Q: How do I deploy Edge Functions?**

```bash
# Deploy function
supabase functions deploy function-name

# Set secrets
supabase secrets set API_KEY=value

# View logs
supabase functions logs function-name
```

---

<div align="center">

**Complete Development Guide**

For architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md)

For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)

**Made with ❤️ by Bubu & Dudu Dev Team**

</div>
