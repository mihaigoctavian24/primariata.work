# Contributing to primariaTa❤️\_

<div align="center">

**Welcome, contributor! 🎉**

Thank you for your interest in making primariaTa❤️\_ better.
This guide will help you contribute effectively and professionally.

[Code of Conduct](#code-of-conduct) • [Getting Started](#getting-started) • [Development Workflow](#development-workflow) • [Code Standards](#code-standards) • [Pull Requests](#pull-requests)

</div>

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Fork & Clone](#fork--clone)
  - [Installation](#installation)
- [Development Workflow](#development-workflow)
  - [Branch Strategy](#branch-strategy)
  - [Making Changes](#making-changes)
  - [Commit Guidelines](#commit-guidelines)
- [Code Standards](#code-standards)
  - [TypeScript Guidelines](#typescript-guidelines)
  - [React Best Practices](#react-best-practices)
  - [File Naming Conventions](#file-naming-conventions)
  - [Code Style](#code-style)
- [Testing Requirements](#testing-requirements)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)
  - [E2E Tests](#e2e-tests)
- [Pull Request Process](#pull-request-process)
  - [Before Submitting](#before-submitting)
  - [PR Template](#pr-template)
  - [Code Review](#code-review)
- [Additional Resources](#additional-resources)

---

## Code of Conduct

### Our Pledge 🙈 🙉 🙊

We are committed to providing a welcoming and inspiring community for all. We expect all participants to:

- ✅ Use welcoming and inclusive language
- ✅ Be respectful of differing viewpoints and experiences
- ✅ Gracefully accept constructive criticism
- ✅ Focus on what is best for the community
- ✅ Show empathy towards other community members

### Unacceptable Behavior

- ❌ Harassment, trolling, or discriminatory language
- ❌ Publishing others' private information without permission
- ❌ Any conduct which could reasonably be considered inappropriate

**Enforcement**: Violations may result in temporary or permanent ban from the project.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

| Tool             | Version        | Installation                                                                       |
| ---------------- | -------------- | ---------------------------------------------------------------------------------- |
| **Node.js**      | 20.x or higher | [Download](https://nodejs.org/)                                                    |
| **pnpm**         | 8.x or higher  | `npm install -g pnpm`                                                              |
| **Git**          | Latest         | [Download](https://git-scm.com/)                                                   |
| **Supabase CLI** | Latest         | `brew install supabase/tap/supabase` (macOS)<br>`npm install -g supabase` (others) |

**Optional but Recommended:**

- VS Code with recommended extensions (ESLint, Prettier, Tailwind CSS IntelliSense)
- GitHub CLI: `brew install gh` or `npm install -g gh`

### Fork & Clone

1. **Fork the repository** on GitHub (click "Fork" button)

2. **Clone your fork**:

   ```bash
   git clone https://github.com/YOUR-USERNAME/primariata.work.git
   cd primariata.work
   ```

3. **Add upstream remote**:

   ```bash
   git remote add upstream https://github.com/mihaigoctavian24/primariata.work.git
   ```

4. **Verify remotes**:
   ```bash
   git remote -v
   # origin    https://github.com/YOUR-USERNAME/primariata.work.git (fetch)
   # origin    https://github.com/YOUR-USERNAME/primariata.work.git (push)
   # upstream  https://github.com/mihaigoctavian24/primariata.work.git (fetch)
   # upstream  https://github.com/mihaigoctavian24/primariata.work.git (push)
   ```

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Install Playwright browsers (for E2E tests)
pnpm playwright:install

# 4. Start development server
pnpm dev

# 🎉 Open http://localhost:3000
```

**Verify installation**:

```bash
pnpm type-check  # Should pass with no errors
pnpm lint        # Should pass with no errors
pnpm test        # Should run without failures
```

---

## Development Workflow

### Branch Strategy

We follow a **Git Flow** inspired workflow:

```
main          ──●────────●────────●──────>  (Production releases)
               /        /        /
develop   ────●────●───●────●───●────────>  (Integration branch)
              /    /        /
feature/*  ──●────●        /               (New features)
                  /        /
fix/*     ───────●────────●                (Bug fixes)
```

**Branch Types:**

| Branch Pattern | Purpose                 | Base Branch | Merge Target       |
| -------------- | ----------------------- | ----------- | ------------------ |
| `main`         | Production-ready code   | -           | -                  |
| `develop`      | Integration branch      | `main`      | `main`             |
| `feature/*`    | New features            | `develop`   | `develop`          |
| `fix/*`        | Bug fixes               | `develop`   | `develop`          |
| `hotfix/*`     | Urgent production fixes | `main`      | `main` + `develop` |
| `chore/*`      | Maintenance tasks       | `develop`   | `develop`          |
| `docs/*`       | Documentation updates   | `develop`   | `develop`          |

### Making Changes

**1. Sync with upstream**:

```bash
git checkout develop
git pull upstream develop
```

**2. Create feature branch**:

```bash
git checkout -b feature/your-feature-name

# Examples:
# feature/add-payment-gateway
# feature/user-dashboard
# fix/login-redirect-bug
# chore/update-dependencies
```

**3. Make your changes**:

- Write clean, documented code
- Follow code standards (see [Code Standards](#code-standards))
- Add tests for new functionality
- Update documentation if needed

**4. Commit your changes** (see [Commit Guidelines](#commit-guidelines)):

```bash
git add .
git commit -m "feat(auth): implement Google OAuth login"
```

**5. Keep branch updated**:

```bash
# Regularly sync with develop
git fetch upstream
git rebase upstream/develop
```

**6. Push to your fork**:

```bash
git push origin feature/your-feature-name
```

**7. Open Pull Request** (see [Pull Request Process](#pull-request-process))

### Commit Guidelines

We follow **[Conventional Commits](https://www.conventionalcommits.org/)** specification:

#### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

#### Type

**Must be one of:**

| Type       | Description                     | Example                            |
| ---------- | ------------------------------- | ---------------------------------- |
| `feat`     | New feature                     | `feat(auth): add Google OAuth`     |
| `fix`      | Bug fix                         | `fix(api): resolve CORS issue`     |
| `docs`     | Documentation only              | `docs(readme): update setup guide` |
| `style`    | Code style changes (formatting) | `style: fix indentation`           |
| `refactor` | Code refactoring                | `refactor(db): optimize queries`   |
| `perf`     | Performance improvement         | `perf(api): cache responses`       |
| `test`     | Adding/updating tests           | `test(auth): add login tests`      |
| `build`    | Build system changes            | `build: upgrade Next.js`           |
| `ci`       | CI/CD changes                   | `ci: add E2E workflow`             |
| `chore`    | Maintenance tasks               | `chore(deps): update packages`     |
| `revert`   | Revert previous commit          | `revert: feat(auth): OAuth`        |

#### Scope

**Allowed scopes:**

`phase-0`, `phase-1`, `phase-2`, `phase-3`, `phase-4`, `phase-5`, `phase-6`, `auth`, `api`, `ui`, `db`, `config`, `deps`

**Examples:**

```bash
feat(phase-0): implement git hooks setup
fix(auth): resolve session expiration bug
docs(readme): add troubleshooting section
refactor(ui): migrate to shadcn/ui v2
test(api): add request validation tests
```

#### Subject

- Use imperative mood: "add" not "added" or "adds"
- Don't capitalize first letter
- No period at the end
- Maximum 72 characters

✅ **Good:**

```
feat(auth): add password reset functionality
fix(ui): resolve button alignment issue
```

❌ **Bad:**

```
feat(auth): Added password reset functionality.
fix(ui): Resolves button alignment issues
```

#### Body (Optional)

- Explain **what** and **why**, not **how**
- Wrap at 72 characters
- Separate from subject with blank line

**Example:**

```
feat(payments): integrate Ghișeul.ro payment gateway

Add support for online tax payments through Ghișeul.ro API.
Implements payment initiation, callback handling, and receipt generation.

Closes #123
```

#### Footer (Optional)

**Breaking Changes:**

```
BREAKING CHANGE: API endpoint /api/users renamed to /api/accounts
```

**Issue References:**

```
Closes #123
Fixes #456
Related to #789
```

#### Complete Examples

```bash
# Simple feature
feat(cereri): add document upload component

# Bug fix with details
fix(auth): resolve infinite redirect loop

Users were stuck in redirect loop when accessing protected routes
without authentication. Fixed by checking session state before redirect.

Fixes #245

# Breaking change
refactor(api)!: redesign authentication endpoints

BREAKING CHANGE: /api/auth/login now returns { token, user } instead of { accessToken }
Migrate by updating response parsing in login handlers.

# Multiple issues
test(e2e): add comprehensive authentication flow tests

Covers login, logout, session persistence, and OAuth flows.

Closes #301, #302, #303
```

#### Commit Validation

Commits are **automatically validated** by commitlint on `git commit`:

```bash
# ✅ Valid - commit succeeds
git commit -m "feat(auth): add OAuth login"

# ❌ Invalid - commit fails
git commit -m "Added OAuth login"
# Error: subject may not be empty [subject-empty]
# Error: type may not be empty [type-empty]
```

---

## Code Standards

### TypeScript Guidelines

**1. Always use TypeScript** - No `.js` or `.jsx` files

**2. Enable strict mode** (already configured in `tsconfig.json`):

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**3. Prefer `interface` over `type` for object shapes**:

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  role: "admin" | "user";
}

// ❌ Avoid (unless needed for unions/intersections)
type User = {
  id: string;
  email: string;
};
```

**4. Use explicit return types for functions**:

```typescript
// ✅ Good
function getUser(id: string): Promise<User> {
  return supabase.from("users").select().eq("id", id).single();
}

// ❌ Avoid
function getUser(id: string) {
  return supabase.from("users").select().eq("id", id).single();
}
```

**5. Avoid `any` - use `unknown` or proper types**:

```typescript
// ✅ Good
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

// ❌ Avoid
function parseJSON(json: string): any {
  return JSON.parse(json);
}
```

### React Best Practices

**1. Component Structure**:

```tsx
// ✅ Good: Props interface → Component → Export
interface ButtonProps {
  variant?: "default" | "destructive";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = "default", size = "md", children, onClick }: ButtonProps) {
  return (
    <button className={cn("btn", `btn-${variant}`, `btn-${size}`)} onClick={onClick}>
      {children}
    </button>
  );
}
```

**2. Use Server Components by default** (Next.js 15):

```tsx
// ✅ Server Component (default)
export default async function UsersPage() {
  const users = await getUsers();
  return <UserList users={users} />;
}

// Only use 'use client' when needed (interactivity, hooks)
("use client");
export function UserForm() {
  const [name, setName] = useState("");
  // ...
}
```

**3. Prefer named exports over default exports**:

```typescript
// ✅ Good
export function Button() {}
export function Card() {}

// ❌ Avoid (except for pages)
export default function Button() {}
```

**4. Use custom hooks for reusable logic**:

```typescript
// hooks/use-auth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, login, logout };
}
```

**5. Memoize expensive computations**:

```tsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

### File Naming Conventions

| Type           | Convention            | Example              |
| -------------- | --------------------- | -------------------- |
| **Components** | `kebab-case.tsx`      | `user-profile.tsx`   |
| **Pages**      | `kebab-case/page.tsx` | `dashboard/page.tsx` |
| **Utilities**  | `camelCase.ts`        | `formatDate.ts`      |
| **Hooks**      | `use-*.ts`            | `use-auth.ts`        |
| **Types**      | `PascalCase.ts`       | `User.ts`            |
| **Constants**  | `UPPER_SNAKE_CASE.ts` | `API_ENDPOINTS.ts`   |
| **Tests**      | `*.test.ts(x)`        | `button.test.tsx`    |

**Directory structure:**

```
src/
├── app/                    # Next.js pages (kebab-case)
│   ├── dashboard/
│   │   └── page.tsx
│   └── layout.tsx
├── components/             # Components (kebab-case)
│   ├── ui/
│   │   ├── button.tsx
│   │   └── card.tsx
│   └── auth/
│       └── login-form.tsx
├── lib/                    # Utilities (camelCase)
│   ├── utils.ts
│   └── supabase/
│       └── client.ts
├── hooks/                  # Custom hooks (use-*)
│   └── use-auth.ts
├── types/                  # Type definitions
│   └── database.types.ts
└── store/                  # State management
    └── auth.ts
```

### Code Style

**Enforced by ESLint + Prettier** (runs on `git commit`):

**1. Indentation**: 2 spaces

```typescript
// ✅ Good
function example() {
  if (condition) {
    return true;
  }
}
```

**2. Quotes**: Double quotes for strings

```typescript
// ✅ Good
const message = "Hello, world!";

// ❌ Avoid
const message = "Hello, world!";
```

**3. Semicolons**: Required

```typescript
// ✅ Good
const x = 10;
const y = 20;

// ❌ Avoid
const x = 10;
const y = 20;
```

**4. Arrow functions**: Prefer arrow functions for callbacks

```typescript
// ✅ Good
array.map((item) => item.id);

// ❌ Avoid
array.map(function (item) {
  return item.id;
});
```

**5. Object/Array trailing commas**: Always

```typescript
// ✅ Good
const user = {
  id: "1",
  email: "user@example.com",
};

// ❌ Avoid
const user = {
  id: "1",
  email: "user@example.com",
};
```

**6. Max line length**: 100 characters

```typescript
// ✅ Good
const message =
  "This is a very long message that exceeds 100 characters so we break it into multiple lines";

// ❌ Avoid (>100 chars)
const message = "This is a very long message that exceeds 100 characters and we don't break it";
```

**Run formatters manually:**

```bash
pnpm lint        # Check for issues
pnpm lint --fix  # Auto-fix issues
pnpm format      # Format all files
```

---

## Testing Requirements

All new features and bug fixes **must include tests**.

### Unit Tests

**Framework**: Jest + React Testing Library

**Location**: `tests/unit/` or `__tests__/` adjacent to component

**Run tests:**

```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
```

**Example:**

```typescript
// components/ui/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-destructive');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Coverage requirements:**

- **Branches**: 80%+
- **Functions**: 80%+
- **Lines**: 90%+
- **Statements**: 90%+

### Integration Tests

**Location**: `tests/integration/`

**Purpose**: Test interactions between modules (API routes, database operations)

**Example:**

```typescript
// tests/integration/auth.test.ts
import { createClient } from "@/lib/supabase/server";

describe("Authentication Integration", () => {
  it("should create user and session", async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: "test@example.com",
      password: "password123",
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.session).toBeDefined();
  });
});
```

### E2E Tests

**Framework**: Playwright

**Location**: `e2e/`

**Run tests:**

```bash
pnpm test:e2e              # All browsers
pnpm test:e2e:chromium     # Chromium only
pnpm test:e2e:ui           # UI mode
pnpm test:e2e:debug        # Debug mode
```

**Example:**

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "user@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Welcome back")).toBeVisible();
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "invalid@example.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Invalid credentials")).toBeVisible();
  });
});
```

**E2E Coverage**: All critical user flows must have E2E tests

---

## Pull Request Process

### Before Submitting

**Checklist:**

- [ ] Code follows style guidelines (ESLint + Prettier)
- [ ] TypeScript compiles without errors (`pnpm type-check`)
- [ ] All tests pass (`pnpm test` + `pnpm test:e2e`)
- [ ] Coverage meets requirements (90%+ for new code)
- [ ] Documentation updated (README, code comments, etc.)
- [ ] Commit messages follow Conventional Commits
- [ ] Branch is up-to-date with `develop`
- [ ] No merge conflicts

**Run validation:**

```bash
pnpm validate  # Runs type-check + lint + format:check
pnpm test:all  # Runs all tests (unit + E2E)
pnpm build     # Verify production build
```

### PR Template

When creating a PR, our template will guide you. **Complete all sections:**

1. **Description** - What does this PR do?
2. **Type of Change** - feat, fix, docs, etc.
3. **Related Issues** - Link to issues (Closes #123)
4. **Checklist** - Complete all items
5. **Screenshots** - For UI changes (before/after)
6. **Breaking Changes** - Document if applicable

**Example PR title:**

```
feat(auth): implement Google OAuth login
```

**PR labels** (added by maintainers):

- `phase-0`, `phase-1`, etc. - Development phase
- `feature`, `bugfix`, `documentation` - PR type
- `needs-review`, `approved`, `changes-requested` - Review status
- `breaking-change` - Breaking changes

### Code Review

**Review process:**

1. **Automated checks** run (CI/CD):
   - ✅ Type checking
   - ✅ Linting
   - ✅ Unit tests
   - ✅ E2E tests
   - ✅ Build verification

2. **Code review** by maintainer(s):
   - Code quality
   - Architecture alignment
   - Test coverage
   - Documentation completeness

3. **Approval** - At least 1 approval required

4. **Merge** - Squash and merge into `develop`

**Review timeline:**

- Initial review: Within 48 hours
- Follow-up: Within 24 hours

**Addressing feedback:**

```bash
# Make requested changes
git add .
git commit -m "fix: address review feedback"
git push origin feature/your-feature
# PR updates automatically
```

---

## Additional Resources

### Documentation

- **[Architecture Guide](ARCHITECTURE.md)** - System design and data flow
- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Common tasks and examples
- **[README.md](README.md)** - Project overview and setup
- **[Technical Specs](.docs/02-technical-specs/)** - Database, API, infrastructure

### External Resources

- **[Next.js Documentation](https://nextjs.org/docs)** - Framework reference
- **[Supabase Documentation](https://supabase.com/docs)** - Backend reference
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - Language guide
- **[Conventional Commits](https://www.conventionalcommits.org/)** - Commit format
- **[shadcn/ui](https://ui.shadcn.com/)** - UI component library

### Getting Help

**Questions?** We're here to help:

1. **Check existing documentation** - README, guides, .docs/
2. **Search existing issues** - Someone may have asked before
3. **Open a discussion** - For general questions
4. **Create an issue** - For bugs or feature requests

**Contact:**

- 📧 **Octavian Mihai**: mihai.g.octavian24@stud.rau.ro
- 📧 **Bianca-Maria Abbasi**: abbasipazeyazd.h.biancamaria24@stud.rau.ro
- 💬 **GitHub Issues**: [Create issue](https://github.com/mihaigoctavian24/primariata.work/issues)

---

<div align="center">

**Thank you for contributing to primariaTa❤️\_!** 🚀

Together, we're digitizing Romania, one city hall at a time.

**Made with ❤️ by Bubu & Dudu Dev Team**

</div>
