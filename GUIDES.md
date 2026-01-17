# AI Development Guidelines for primariaTa❤️\_

**Purpose**: Rules specific to primariaTa platform for AI code generation (Claude Code, GitHub Copilot, Cursor AI)
**Context**: Romanian government digitalization SaaS for city halls (primării)
**Version**: 1.0
**Last Updated**: 2025-01-14

---

## General Guidelines for primariaTa

- Only use absolute positioning when necessary for modals/dropdowns. Default to Flexbox (1D layouts) and Grid (2D layouts)
- Refactor as you go to keep code clean and maintainable
- Keep components under 300 lines - extract logic to hooks/utils
- Group files by feature, not by type (`src/features/cereri/` NOT `src/components/cereri/`)
- Default to Server Components - only use `"use client"` when necessary (forms, interactions, browser APIs)
- Never expose sensitive data - check RLS policies before queries
- All user-facing text must be in Romanian with correct diacritics (ă, â, î, ș, ț)

---

## Design System for primariaTa

### Colors - Official Brand Palette

**Primary Actions & Branding**:

- `bg-primary` (#E91E63) - Main CTAs, links, active states, Romanian red for trust
- Use for: "Trimite Cererea" buttons, navigation active states, primary actions

**Semantic Colors**:

- `bg-success` (#3ECF8E) - Completed requests, success messages, Supabase green
- `bg-warning` (#FF9800) - Pending requests, warnings, requires attention
- `bg-destructive` (#F44336) - Rejected requests, errors, dangerous actions
- `bg-info` (#2196F3) - Informational messages, tips, neutral notifications

**Status Badge Colors** (Cereri Module):

```tsx
// Use these exact colors for request status badges
"draft" → bg-gray-500 (gray)
"submitted" → bg-blue-500 (info blue)
"processing" → bg-warning (orange)
"approved" → bg-success (green)
"rejected" → bg-destructive (red)
"completed" → bg-success with checkmark icon
```

**Rules**:

- Maximum 2 colors per screen (primary + one semantic)
- Never use color as the only indicator - add icons AND text labels
- Test all color combinations for WCAG 2.1 AA contrast (4.5:1 minimum)

### Typography - Inter Font Family

**Base Settings**:

- Font: Inter (Google Fonts) - clean, modern, highly legible for Romanian diacritics
- Base size: 16px - prevents iOS auto-zoom on inputs
- Line height: 1.5 (body text), 1.2 (headings)

**Text Scales**:

```tsx
// Headings
text-3xl font-bold  // Page titles (30px) - "Cererile Mele"
text-2xl font-bold  // Section headers (24px) - "Documente Necesare"
text-xl font-semibold // Card titles (20px) - "Certificat Urbanism"

// Body
text-base font-normal  // Default body (16px) - form descriptions
text-sm font-medium    // Labels, captions (14px) - form labels
text-xs font-normal    // Helper text (12px) - "Maxim 10 MB"
```

**Never**:

- Use fonts other than Inter (consistency)
- Go below 14px for body text (accessibility)
- Use font weights outside 400/500/600/700

### Spacing - 4px Grid System

**Component Padding**:

- `p-4` (16px) - Compact cards, mobile layouts
- `p-6` (24px) - Standard cards, desktop comfort

**Gaps & Margins**:

- `gap-2` (8px) - Tight grouping (icon + text)
- `gap-4` (16px) - Form field spacing
- `gap-6` (24px) - Section internal spacing
- `mb-8` (32px) - Between major sections

**Never use**:

- Arbitrary values like `p-[13px]` - stick to Tailwind scale
- Negative margins for layout - use proper flex/grid gap instead

### Border Radius

```tsx
rounded - md; // 6px - Buttons, Inputs, small cards
rounded - lg; // 8px - Cards, content containers
rounded - xl; // 12px - Modals, dialogs
rounded - full; // Pills - Status badges, avatar
```

---

## Component Guidelines - primariaTa Specifics

### Button Component

**Usage Context**: Form submissions, navigation, actions on cereri

**Variants**:

```tsx
// Primary - main action (ONE per section)
<Button variant="default">Trimite Cererea</Button>

// Secondary - cancel, go back
<Button variant="outline">Anulează</Button>

// Destructive - delete request, reject application
<Button variant="destructive">Șterge Cererea</Button>

// Ghost - edit, view details (subtle)
<Button variant="ghost">Editează</Button>
```

**Rules for primariaTa**:

- Action-oriented labels in Romanian: "Trimite" NOT "Trimitere"
- Loading state required for async: `<Button disabled={isPending}>...</Button>`
- Icon buttons need `aria-label` in Romanian: `aria-label="Închide dialogul"`
- One primary button per form section
- Disabled buttons must show tooltip explaining why (Romanian)

**Sizes**:

- `size="sm"` - Secondary actions in tables
- `size="default"` - Standard form buttons
- `size="lg"` - Hero CTAs on landing page

**Example**:

```tsx
<Button variant="default" size="lg" disabled={isSubmitting} aria-busy={isSubmitting}>
  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Trimite Cererea
</Button>
```

### Form Inputs - Cereri Module

**Critical Rules**:

- All inputs MUST have `<Label>` with Romanian text
- Required fields marked with asterisk: `<Label>Email *</Label>`
- Use `react-hook-form` + `zod` for validation
- Error messages in Romanian, shown below input
- Placeholder shows example, NOT instructions

**Structure**:

```tsx
<FormField
  control={form.control}
  name="cnp"
  render={({ field }) => (
    <FormItem>
      <FormLabel>CNP *</FormLabel>
      <FormControl>
        <Input placeholder="1234567890123" maxLength={13} {...field} />
      </FormControl>
      <FormDescription>Codul Numeric Personal (13 cifre)</FormDescription>
      <FormMessage /> {/* Error display */}
    </FormItem>
  )}
/>
```

**Input Types for primariaTa**:

- CNP: 13 digits, numeric only, required validation
- Email: Romanian format validation, required for notifications
- Phone: +40 prefix for Romanian numbers
- Address: Autocomplete from `localitati` table
- File Upload: PDF/JPG/PNG only, 10MB max, progress indicator required

**Validation Messages (Romanian)**:

```tsx
// ✅ Good - clear, actionable, Romanian
"Email invalid. Exemplu corect: ion.popescu@email.com";
"CNP trebuie să aibă exact 13 cifre";
"Fișierul e prea mare. Dimensiune maximă: 10 MB";

// ❌ Bad - generic, English, unhelpful
"Invalid email";
"Validation failed";
"File too large";
```

### Card Component - Cerere Display

**Usage**: Display individual cerere (request) in dashboard, list views

**Structure for Cerere Card**:

```tsx
<Card className="transition-shadow hover:shadow-md">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Certificat Urbanism</CardTitle>
      <Badge variant="warning">În procesare</Badge>
    </div>
    <CardDescription>Depusă: 15 ianuarie 2025, 14:30</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Număr cerere:</span>
        <span className="font-medium">ZN-2025-00123</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Adresa:</span>
        <span>Str. Libertății nr. 15</span>
      </div>
    </div>
  </CardContent>
  <CardFooter className="gap-2">
    <Button variant="outline" size="sm">
      <Eye className="mr-2 h-4 w-4" />
      Vezi Detalii
    </Button>
    <Button variant="ghost" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Descarcă PDF
    </Button>
  </CardFooter>
</Card>
```

**Rules**:

- Don't nest cards more than 2 levels
- Status badge always top-right in header
- Use semantic color for badges based on status
- Include hover effect for clickable cards: `hover:shadow-md transition-shadow`

### Modal/Dialog - Confirmation Flows

**Usage**: Confirm dangerous actions (delete cerere), display detailed info

**Rules for primariaTa**:

- Maximum width: `max-w-2xl` (forms), `max-w-lg` (confirmations)
- Always closable: X button + ESC key
- Focus trap inside modal
- Destructive confirmations must show impact: "Ștergi cererea #ZN-2025-00123?"

**Confirmation Dialog Template**:

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Șterge Cererea</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Ești absolut sigur?</AlertDialogTitle>
      <AlertDialogDescription>
        Această acțiune va șterge permanent cererea <strong>#ZN-2025-00123</strong>. Documentele
        atașate vor fi șterse și nu pot fi recuperate.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Anulează</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive">Șterge Permanent</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Toast Notifications - User Feedback

**Usage**: Success confirmations, error alerts, info updates

**Position**: Top-right (desktop), top-center (mobile)

**Auto-dismiss**: 3 seconds (success), 5 seconds (error/info)

**Examples for primariaTa**:

```tsx
import { toast } from "sonner";

// Success - cerere submitted
toast.success("Cererea a fost trimisă cu succes!", {
  description: "Număr cerere: ZN-2025-00123",
});

// Error - upload failed
toast.error("Nu am putut încărca documentul", {
  action: {
    label: "Încearcă din nou",
    onClick: () => retryUpload(),
  },
});

// Info - document ready
toast.info("Document nou disponibil", {
  description: "Certificatul tău urbanism e gata de descărcare",
  action: {
    label: "Descarcă",
    onClick: () => downloadDocument(),
  },
});

// Warning - session expiring
toast.warning("Sesiunea expiră în 5 minute", {
  description: "Salvează modificările pentru a nu pierde datele",
});
```

**Rules**:

- Max 3 toasts stacked at once
- Include icon matching variant (CheckCircle, XCircle, Info, AlertTriangle)
- Action button when user can do something (Retry, View, Download)

---

## Romanian Language Rules

### Tone & Voice for primariaTa

**Official Communications** (emails, legal documents, certificates):

- Formal "dumneavoastră"
- Professional, respectful
- Example: "Stimate domn/doamnă, cererea dumneavoastră a fost aprobată"

**UI Elements** (buttons, labels, instructions):

- Informal "tu" (conversational, friendly)
- Direct, action-oriented
- Example: "Trimite cererea", "Vezi detaliile", "Descarcă documentul"

### Common Translations for UI

```
Submit → "Trimite" (NOT "Depune" - too bureaucratic)
Cancel → "Anulează"
Save → "Salvează"
Delete → "Șterge"
Edit → "Editează"
View → "Vezi" or "Vizualizează"
Download → "Descarcă"
Upload → "Încarcă"
Next → "Următorul"
Previous → "Înapoi"
Confirm → "Confirmă"
Request → "Cerere" (singular), "Cereri" (plural)
Document → "Document" (singular), "Documente" (plural)
Status → "Status" or "Stare"
Pending → "În așteptare" or "Pending"
Approved → "Aprobat"
Rejected → "Respins"
Completed → "Finalizat"
```

### Date & Time Formats (Romanian)

```tsx
// Full date - 15 ianuarie 2025 (NOT "Jan 15, 2025")
import { format } from "date-fns";
import { ro } from "date-fns/locale";

format(new Date(), "dd MMMM yyyy", { locale: ro });
// Output: "15 ianuarie 2025"

// Short date - 15 Ian 2025
format(new Date(), "dd MMM yyyy", { locale: ro });

// DateTime - 15 Ian 2025, 14:30
format(new Date(), "dd MMM yyyy, HH:mm", { locale: ro });

// Relative - "acum 2 minute", "ieri", "săptămâna trecută"
import { formatDistanceToNow } from "date-fns";
formatDistanceToNow(date, { addSuffix: true, locale: ro });
```

### Error Messages (Romanian)

Write clear, actionable error messages:

```tsx
// ✅ Good - specific, helpful, Romanian
"Email invalid. Exemplu corect: ion.popescu@email.com";
"CNP trebuie să aibă exact 13 cifre. Ai introdus {length} cifre.";
"Fișierul e prea mare. Dimensiune maximă: 10 MB. Ai încărcat: {size} MB";
"Câmp obligatoriu. Te rugăm să completezi adresa ta.";

// ❌ Bad - vague, technical, English
"Invalid input";
"Validation error";
"Error 400";
"Field required";
```

---

## Data Fetching Patterns

### Server Components (Preferred for primariaTa)

**Use for**: Initial page loads, SEO content, non-interactive data display

```tsx
// app/cereri/page.tsx - Server Component (default)
import { createClient } from "@/lib/supabase/server";

export default async function CereriPage() {
  const supabase = await createClient();

  const { data: cereri, error } = await supabase
    .from("cereri")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cereri:", error);
    return <ErrorMessage />;
  }

  return <CereriList cereri={cereri} />;
}
```

**Benefits**: No client-side JS, better SEO, faster initial load

### Client Components (When Interactive)

**Use for**: Forms, real-time updates, user interactions

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export function RealTimeCereriList() {
  const [cereri, setCereri] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to real-time changes
    const channel = supabase
      .channel("cereri_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "cereri" }, (payload) => {
        // Update UI in real-time
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <CereriList cereri={cereri} />;
}
```

### Row Level Security (RLS) - Critical for Multi-Tenancy

**ALWAYS check RLS policies before queries**:

- Users can only see cereri from their `localitate_id`
- Staff can only modify cereri assigned to their `primarie_id`
- Admins have elevated permissions but still scoped to their primarie

```tsx
// ✅ Good - RLS automatically filters by user's localitate
const { data } = await supabase.from("cereri").select("*");
// RLS policy ensures only user's cereri are returned

// ❌ Bad - trying to bypass RLS with service role on client
// NEVER expose service role key to client
```

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation

**All interactive elements must be keyboard accessible**:

- Tab/Shift+Tab to navigate
- Enter/Space to activate buttons
- Escape to close modals/dropdowns
- Arrow keys for select/combobox

**Focus indicators**:

```tsx
// Always include visible focus state
className = "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
```

### ARIA Labels (Romanian)

```tsx
// Icon buttons
<Button variant="ghost" size="icon" aria-label="Închide">
  <X className="h-4 w-4" />
</Button>

// File input
<Input
  type="file"
  aria-label="Încarcă document PDF"
  accept=".pdf"
/>

// Loading state
<Button disabled aria-busy="true">
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Se încarcă...
</Button>

// Form validation
<Input
  aria-required="true"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <p id="email-error" className="text-sm text-destructive">
    {errors.email.message}
  </p>
)}
```

### Screen Reader Support

- Use semantic HTML: `<nav>`, `<main>`, `<article>`, `<aside>`, `<section>`
- Alt text for images in Romanian: `<img src="..." alt="Logo primărie Zimandu Nou" />`
- Skip to main content link for screen readers
- Hide decorative icons: `<Icon aria-hidden="true" />`

---

## Performance Optimization

### Code Splitting

```tsx
// Lazy load heavy components (charts, admin dashboard)
import dynamic from "next/dynamic";

const AdminAnalytics = dynamic(() => import("@/components/admin/Analytics"), {
  loading: () => <LoadingSkeleton />,
});

// Don't lazy load above-fold content
```

### Image Optimization

```tsx
import Image from 'next/image';

// ✅ Good - Next.js Image component
<Image
  src="/logo-primarie.png"
  alt="Logo Primăria Zimandu Nou"
  width={120}
  height={60}
  priority // for LCP images (hero, logo)
/>

// For below-fold images
<Image
  src="/document-preview.jpg"
  alt="Previzualizare certificat"
  width={400}
  height={300}
  loading="lazy"
/>
```

### Bundle Size

- Use named imports: `import { Button } from "@/components/ui/button"`
- Avoid large libraries for simple tasks (use `date-fns` NOT `moment.js`)
- Check bundle: `pnpm build && pnpm analyze`

---

## Security Guidelines

### Authentication

**NEVER expose sensitive keys**:

```bash
# ✅ Server-side only
SUPABASE_SERVICE_ROLE_KEY=xxx  # NEVER in client code

# ✅ Client-safe
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Data Validation

**Always validate both client AND server**:

```tsx
// Client validation with Zod
const cerereSchema = z.object({
  cnp: z.string().length(13, "CNP trebuie să aibă 13 cifre"),
  email: z.string().email("Email invalid"),
  telefon: z.string().regex(/^\+40\d{9}$/, "Format: +40 followed by 9 digits"),
});

// Server validation (API route or Server Action)
// Re-validate on server, never trust client input
```

### File Uploads

```tsx
// Validation rules for primariaTa
const FILE_RULES = {
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
  virusScan: true, // Future integration
};

// Example validation
<Input
  type="file"
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > FILE_RULES.maxSize) {
      toast.error("Fișier prea mare. Maxim 10 MB permis.");
      return;
    }

    // Upload to Supabase Storage
  }}
/>;
```

---

## Testing Guidelines

### What to Test for primariaTa

✅ **Test These**:

- Form submission flows (cerere creation, document upload)
- User authentication (login, logout, session)
- Status changes (cerere lifecycle: draft → submitted → processing → approved)
- File upload/download
- Filtering and search in cereri list
- Role-based permissions (citizen vs staff vs admin)

❌ **Don't Test These**:

- Supabase internals
- Next.js routing
- Third-party library functions
- Styling/CSS (visual regression separate)

### Test Structure

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CerereForm } from "./CerereForm";

describe("CerereForm", () => {
  it("validates CNP format before submission", async () => {
    const user = userEvent.setup();
    render(<CerereForm />);

    const cnpInput = screen.getByLabelText(/cnp/i);
    await user.type(cnpInput, "123"); // Invalid CNP (too short)

    const submitButton = screen.getByRole("button", { name: /trimite/i });
    await user.click(submitButton);

    // Expect Romanian error message
    expect(screen.getByText(/cnp trebuie să aibă exact 13 cifre/i)).toBeInTheDocument();
  });
});
```

---

## Git Workflow

### Commit Messages (Conventional Commits)

```
type(scope): description in English (code comments in Romanian)

Examples:
feat(cereri): add multi-step form for certificat urbanism
fix(auth): resolve session expiration on page refresh
docs(readme): update local development setup
style(button): adjust primary button padding for mobile
refactor(utils): extract date formatting to shared utility
test(form): add CNP validation tests
chore(deps): update Supabase client to v2.39.0
```

### Branch Naming

```
feature/cereri-multi-step-form
fix/auth-session-bug
docs/api-documentation
refactor/extract-form-validation
test/cereri-submission-flow
chore/update-dependencies
```

---

## Common Patterns for primariaTa

### Loading States

```tsx
// Skeleton for cereri list loading
import { Skeleton } from "@/components/ui/skeleton";

{
  isLoading ? (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  ) : (
    <CereriList cereri={cereri} />
  );
}

// Button loading state
<Button disabled={isPending}>
  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isPending ? "Se trimite..." : "Trimite Cererea"}
</Button>;
```

### Error States

```tsx
// Error display for cereri fetch failure
{
  error && (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Eroare la încărcarea cererilor</AlertTitle>
      <AlertDescription>{error.message}. Te rugăm să încerci din nou.</AlertDescription>
    </Alert>
  );
}
```

### Empty States

```tsx
// No cereri found
{
  cereri.length === 0 && (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="mb-4 h-16 w-16 text-muted-foreground" />
      <h3 className="text-lg font-semibold">Nicio cerere activă</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Nu ai încă cereri active. Creează prima ta cerere pentru a începe procesul de aprobare.
      </p>
      <Button className="mt-6">
        <Plus className="mr-2 h-4 w-4" />
        Creare Cerere Nouă
      </Button>
    </div>
  );
}
```

### Status Badge Component

```tsx
// Reusable status badge for cereri
export function StatusBadge({ status }: { status: CerereStatus }) {
  const config = {
    draft: { label: "Ciornă", variant: "secondary" as const },
    submitted: { label: "Depusă", variant: "default" as const },
    processing: { label: "În procesare", variant: "warning" as const },
    approved: { label: "Aprobată", variant: "success" as const },
    rejected: { label: "Respinsă", variant: "destructive" as const },
    completed: { label: "Finalizată", variant: "success" as const },
  };

  const { label, variant } = config[status];

  return <Badge variant={variant}>{label}</Badge>;
}

// Usage
<StatusBadge status="processing" />;
```

---

## Don'ts (Anti-Patterns)

### ❌ Don't Use

- `any` type in TypeScript - use proper types or `unknown`
- Inline styles - use Tailwind utilities
- `@ts-ignore` - fix the underlying type issue
- English text in UI - all user-facing text must be Romanian
- Hardcoded Romanian city names - fetch from `localitati` table
- Direct DOM manipulation - use React state/refs
- `console.log` in production - use proper error tracking
- Absolute positioning for layout - use flex/grid

### ❌ Don't Do

- Commit directly to `main` or `develop` branch
- Skip type checking before commit (`pnpm type-check`)
- Ignore accessibility violations in tests
- Mix Server/Client components without clear `"use client"` directive
- Fetch data in `useEffect` when Server Component is possible
- Create components over 500 lines - extract to smaller pieces
- Use service role key in client-side code (security risk!)
- Forget RLS policies when querying Supabase

---

## primariaTa-Specific Rules

### Multi-Tenancy

- Every cerere MUST have `localitate_id` and `primarie_id`
- Use RLS policies to isolate data between primării
- Never query across primării boundaries (except admin analytics)

### Romanian Localities

- Use `localitati` and `judete` tables for address autocomplete
- Never hardcode city names - always fetch from database
- Support all 13,851 Romanian localities

### Document Management

- Store files in Supabase Storage with RLS policies
- Path format: `{primarie_id}/{cerere_id}/{document_type}/{filename}`
- Generate unique filenames to prevent collisions: `{timestamp}-{uuid}.pdf`
- Always show upload progress indicator
- Validate file type and size before upload

### Notifications

- Send email notifications for status changes (submitted, approved, rejected)
- Use Romanian templates with formal "dumneavoastră"
- Include cerere number and direct link to view details

### Analytics & Reporting

- Mayors should see only their primărie's data
- Reports in Romanian with proper date formatting
- Export to PDF with Romanian diacritics support

---

**Last Updated**: 2025-01-14
**Version**: 1.0
**Next Review**: When adding new features or patterns to primariaTa platform
