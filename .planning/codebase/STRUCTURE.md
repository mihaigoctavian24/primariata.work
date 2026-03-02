# Codebase Structure

**Analysis Date:** 2026-03-02

## Directory Layout

```
primariata.work/
├── src/
│   ├── app/                          # Next.js App Router (pages & routes)
│   │   ├── layout.tsx                # Root layout (fonts, theme, providers)
│   │   ├── page.tsx                  # Landing page (public)
│   │   ├── globals.css               # Global styles + Tailwind
│   │   ├── error.tsx                 # Route error boundary
│   │   ├── global-error.tsx          # App-level error boundary (Sentry)
│   │   ├── not-found.tsx             # 404 page
│   │   │
│   │   ├── auth/                     # Authentication routes (public)
│   │   │   ├── login/page.tsx        # Login form
│   │   │   ├── register/page.tsx     # Registration form
│   │   │   ├── callback/page.tsx     # OAuth callback handler
│   │   │   ├── reset-password/       # Password reset flow
│   │   │   ├── update-password/      # Update password page
│   │   │   ├── accept-invite/        # Staff invitation acceptance
│   │   │   └── auth-code-error/      # Auth error fallback
│   │   │
│   │   ├── app/                      # Protected dashboard routes (authenticated)
│   │   │   ├── dashboard/            # Dashboard redirect
│   │   │   └── [judet]/[localitate]/ # Location-based routes
│   │   │       ├── layout.tsx        # Dashboard layout (nav, sidebar)
│   │   │       ├── page.tsx          # Main dashboard (role-based)
│   │   │       ├── cereri/           # Requests/Forms feature
│   │   │       │   ├── page.tsx      # Request list
│   │   │       │   ├── [id]/page.tsx # Request details
│   │   │       │   └── wizard/       # Multi-step form wizard
│   │   │       ├── plati/            # Payments feature
│   │   │       │   ├── page.tsx      # Payment list
│   │   │       │   ├── [id]/         # Payment details
│   │   │       │   └── checkout/     # Ghișeul payment flow
│   │   │       ├── notificari/       # Notifications feature
│   │   │       │   ├── page.tsx      # Notifications list
│   │   │       │   └── components/   # Notification UI components
│   │   │       ├── profil/           # User profile
│   │   │       ├── setari/           # Settings
│   │   │       ├── admin/            # Staff admin panel
│   │   │       │   └── users/        # User management
│   │   │       └── [components]      # Shared dashboard components
│   │   │
│   │   ├── admin/                    # Super-admin routes (system admin only)
│   │   │   ├── login/page.tsx        # Admin login
│   │   │   ├── auth/callback/        # Admin OAuth callback
│   │   │   ├── users/page.tsx        # System user management
│   │   │   ├── survey/               # Survey research tools
│   │   │   │   ├── page.tsx
│   │   │   │   └── research/
│   │   │   └── primariata/           # System configuration
│   │   │       ├── settings/
│   │   │       ├── admins/
│   │   │       └── primarii/
│   │   │
│   │   ├── api/                      # API routes (Route Handlers)
│   │   │   ├── localitati/           # Location data endpoints
│   │   │   │   ├── route.ts          # GET all localitati
│   │   │   │   └── judete/route.ts   # GET all judete
│   │   │   ├── user/                 # User endpoints
│   │   │   │   └── profile/route.ts  # GET user profile
│   │   │   ├── admin/                # Admin API endpoints
│   │   │   │   ├── users/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── invite/       # Send staff invitations
│   │   │   │   │   └── invitations/  # Manage invitations
│   │   │   │   └── survey/           # Survey APIs
│   │   │   ├── dashboard/            # Dashboard data endpoints
│   │   │   │   ├── search/
│   │   │   │   └── plati-monthly/
│   │   │   ├── payments/             # Payment processing
│   │   │   │   └── ghiseul-mock/     # Mock payment gateway
│   │   │   ├── mock-certsign/        # Mock digital signature service
│   │   │   ├── csp-violations/       # Content Security Policy reporting
│   │   │   └── location/             # Location selection endpoint
│   │   │
│   │   ├── survey/                   # Public survey routes
│   │   ├── termeni/                  # Terms page
│   │   ├── confidentialitate/        # Privacy policy page
│   │   └── test-*/                   # Component test pages (internal)
│   │
│   ├── components/                   # React components (UI + features)
│   │   ├── ui/                       # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── animated-card.tsx     # Custom animated container
│   │   │   └── [30+ more UI components]
│   │   │
│   │   ├── auth/                     # Authentication components
│   │   │   ├── LoginForm.tsx         # Email/password + Google OAuth
│   │   │   ├── AuthLayout.tsx        # Auth page layout (split-screen)
│   │   │   ├── AuthHeader.tsx        # Navigation header
│   │   │   └── LocationBadge.tsx     # Display selected location
│   │   │
│   │   ├── dashboard/                # Dashboard components (role-specific)
│   │   │   ├── role-dashboards/      # Role-based dashboard exports
│   │   │   │   ├── cetatean-dashboard.tsx
│   │   │   │   ├── functionar-dashboard.tsx
│   │   │   │   ├── primar-dashboard.tsx
│   │   │   │   └── admin-dashboard.tsx
│   │   │   ├── charts/               # Chart components (Recharts)
│   │   │   └── [various dashboard sections]
│   │   │
│   │   ├── cereri/                   # Request-related components
│   │   │   ├── create-wizard/        # Multi-step form wizard
│   │   │   └── [request UI components]
│   │   │
│   │   ├── plati/                    # Payment-related components
│   │   │   └── [payment UI components]
│   │   │
│   │   ├── notificari/               # Notification components
│   │   ├── admin/                    # Admin panel components
│   │   │   └── research/             # Survey research UI
│   │   ├── profile/                  # User profile components
│   │   ├── settings/                 # Settings UI
│   │   ├── signature/                # Digital signature components
│   │   ├── location/                 # Location picker components
│   │   ├── landing/                  # Landing page sections
│   │   ├── notifications/            # Generic notification UI
│   │   ├── weather/                  # Weather widget
│   │   ├── survey/                   # Survey components
│   │   ├── animate-ui/               # Custom animation primitives
│   │   ├── providers/                # Context/Provider components
│   │   │   └── query-provider.tsx    # React Query setup
│   │   ├── theme-provider.tsx        # next-themes setup
│   │   ├── error-boundary.tsx        # Error boundary wrapper
│   │   └── 404/                      # 404 page components
│   │
│   ├── lib/                          # Utility functions & business logic
│   │   ├── supabase/                 # Supabase client factory
│   │   │   ├── server.ts             # Server/Server Action client
│   │   │   ├── client.ts             # Browser client
│   │   │   └── middleware.ts         # Middleware session helper
│   │   │
│   │   ├── auth/                     # Authorization helpers
│   │   │   └── authorization.ts      # Auth guards + role checks
│   │   │
│   │   ├── validations/              # Zod validation schemas
│   │   │   ├── cereri.ts             # Request validation
│   │   │   ├── profile.ts            # Profile validation
│   │   │   ├── plati.ts              # Payment validation
│   │   │   ├── notifications.ts      # Notification validation
│   │   │   ├── staff-invite.ts       # Staff invitation validation
│   │   │   └── common.ts             # Shared schemas (UUID, string, etc)
│   │   │
│   │   ├── payments/                 # Payment processing
│   │   │   ├── ghiseul-client.ts     # Ghișeul payment gateway client
│   │   │   ├── ghiseul-mock/         # Mock Ghișeul for testing
│   │   │   ├── types.ts              # Payment type definitions
│   │   │   └── index.ts              # Payment exports
│   │   │
│   │   ├── signature/                # Digital signature
│   │   │   ├── signature-service.ts  # CertSign integration
│   │   │   ├── types.ts              # Signature types
│   │   │   └── index.ts
│   │   │
│   │   ├── pdf/                      # PDF manipulation
│   │   │   └── signature-watermark.ts # Add signatures to PDFs
│   │   │
│   │   ├── sms/                      # SMS notifications
│   │   │   ├── twilio.ts             # Twilio SMS client
│   │   │   └── index.ts
│   │   │
│   │   ├── email/                    # Email notifications
│   │   ├── ai/                       # AI/ML services
│   │   │   ├── openai-client.ts      # OpenAI integration
│   │   │   ├── __mocks__/            # Mock AI responses
│   │   │   └── __tests__/            # AI service tests
│   │   │
│   │   ├── security/                 # Security utilities
│   │   │   └── sanitize.ts           # XSS prevention, input sanitization
│   │   │
│   │   ├── middleware/               # Middleware utilities
│   │   │   ├── csrf-protection.ts    # CSRF token handling
│   │   │   └── rate-limit.ts         # Rate limiting
│   │   │
│   │   ├── monitoring/               # Monitoring utilities
│   │   ├── export/                   # Export utilities (CSV, Excel)
│   │   ├── utils.ts                  # General utilities (cn, formatCurrency)
│   │   ├── location-storage.ts       # Location persistence (localStorage + cookie)
│   │   ├── react-query.ts            # React Query config
│   │   ├── animations.ts             # Framer Motion presets
│   │   ├── chart-utils.ts            # Chart formatting helpers
│   │   ├── rate-limiter.ts           # Rate limiting logic
│   │   └── sync-location.ts          # Location sync utilities
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── index.ts                  # Barrel export of all hooks
│   │   ├── use-user-profile.ts       # Fetch authenticated user profile
│   │   ├── use-cereri-list.ts        # Paginated request list with filters
│   │   ├── use-plati-list.ts         # Payment list hook
│   │   ├── use-notifications-list.ts # Notification list
│   │   ├── use-notifications-realtime.ts # Real-time notifications
│   │   ├── use-unread-notifications.ts  # Unread count
│   │   ├── use-notifications-actions.ts # Mark read/delete actions
│   │   ├── use-cereri-notifications.ts  # Request-specific notifications
│   │   ├── use-dashboard-charts.ts      # Chart data
│   │   ├── use-dashboard-stats.ts       # Stats calculation
│   │   ├── use-dashboard-search.ts      # Search across requests
│   │   ├── use-dashboard-documents.ts   # Document list
│   │   ├── use-dashboard-recommendations.ts # Recommendations
│   │   ├── use-wizard-state.ts          # Form wizard state machine
│   │   ├── use-signature.ts             # Digital signature logic
│   │   ├── useExport.ts                 # CSV/Excel export
│   │   ├── useFilters.ts                # Filter state management
│   │   ├── useRealTimeData.ts           # Real-time data subscriptions
│   │   ├── useMetricsData.ts            # Metrics calculations
│   │   ├── useJudeteWheelPicker.ts      # County selector
│   │   ├── useLocalitatiSearch.ts       # City search
│   │   ├── useLocalitatiWheelPicker.ts  # City selector
│   │   ├── useMetricAnimation.ts        # Animated metrics
│   │   ├── useChartInteractions.ts      # Chart user interactions
│   │   ├── use-debounce.ts              # Debounce values
│   │   └── use-is-in-view.tsx           # Intersection observer hook
│   │
│   ├── store/                        # Zustand state stores
│   │   └── location-store.ts         # Selected location global state
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── database.types.ts         # Auto-generated Supabase schema types
│   │   ├── api.ts                    # API response/error types
│   │   ├── dashboard.ts              # Dashboard-specific types
│   │   ├── survey.ts                 # Survey types
│   │   ├── survey-ai.ts              # AI survey analysis types
│   │   ├── notifications.ts          # Notification types
│   │   ├── wizard.ts                 # Form wizard types
│   │   └── supabase.ts               # Supabase connection config
│   │
│   ├── data/                         # Static data (judete, localitati)
│   ├── styles/                       # Additional stylesheets
│   └── middleware.ts                 # Next.js middleware (session management)
│
├── public/                           # Static assets (not committed to build)
│   ├── fonts/                        # PP Neue Montreal fonts
│   ├── favicon.ico
│   ├── icon.png
│   ├── apple-icon.png
│   └── [other assets]
│
├── tests/                            # Test files (Jest + Playwright)
│   ├── unit/                         # Unit tests
│   │   └── hooks/                    # Hook tests
│   ├── integration/                  # Integration tests
│   │   ├── rls/                      # RLS policy tests
│   │   └── api/                      # API endpoint tests
│   ├── e2e/                          # End-to-end tests (Playwright)
│   └── helpers/                      # Test utilities
│
├── .planning/codebase/               # GSD analysis output
│   ├── ARCHITECTURE.md               # This file
│   ├── STRUCTURE.md                  # Directory layout guide
│   ├── CONVENTIONS.md                # Code style guide
│   ├── TESTING.md                    # Testing patterns
│   ├── STACK.md                      # Tech stack
│   ├── INTEGRATIONS.md               # External services
│   └── CONCERNS.md                   # Known issues
│
├── .docs/                            # Technical documentation
│   ├── 01-requirements/              # PRD, user stories
│   ├── 02-technical-specs/           # API specs, database schema
│   ├── 03-implementation/            # Implementation guides
│   ├── 04-deployment/                # Deployment docs
│   └── 05-quality/                   # QA guidelines
│
├── .claude/                          # Claude Code configuration
├── .supabase/                        # Supabase CLI config
├── .husky/                           # Git hooks (pre-commit, commit-msg)
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.ts                    # Next.js config (CSP headers, image optimization)
├── jest.config.js                    # Jest test config
├── jest.integration.config.js        # Integration test config
├── playwright.config.ts              # Playwright E2E test config
├── tailwind.config.ts                # Tailwind CSS config
├── postcss.config.js                 # PostCSS config
├── .prettierrc                       # Code formatter config
├── .eslintrc                         # Linting config
├── CLAUDE.md                         # Claude development guide
├── ARCHITECTURE.md                   # Architecture documentation
├── README.md                         # Project overview
└── CONTRIBUTING.md                   # Contribution guidelines
```

## Directory Purposes

**src/app/**

- Purpose: Next.js App Router - contains all routes and pages
- Files: layout.tsx (layouts), page.tsx (pages), route.ts (API handlers), error.tsx (error boundaries)
- Key insight: Directory structure maps directly to URL paths
- Example: `src/app/app/[judet]/[localitate]/cereri/page.tsx` → `/app/[judet]/[localitate]/cereri`

**src/components/**

- Purpose: All React components (both Server and Client Components)
- Organized by feature domain: `auth/`, `dashboard/`, `cereri/`, `plati/`, etc.
- `ui/` contains shadcn/ui primitives used everywhere
- Naming: PascalCase for components, exported as named exports

**src/lib/**

- Purpose: Business logic, utilities, and service integration
- Each subdirectory handles a specific domain (auth, payments, validation, etc.)
- Not imported from components directly - used in pages/routes/Server Actions
- All external API integrations (Supabase, Ghișeul, CertSign, Twilio) live here

**src/hooks/**

- Purpose: Custom React hooks encapsulating data fetching and state management
- Each hook typically returns `{ data, isLoading, isError, error }` interface
- Uses React Query for caching and Supabase Realtime for subscriptions
- Can be used from both Server and Client Components (but mostly Client)

**src/types/**

- Purpose: TypeScript type definitions for type safety across entire app
- `database.types.ts` auto-generated from Supabase schema (run `pnpm types:generate`)
- Domain-specific types: `api.ts`, `dashboard.ts`, `notifications.ts`, etc.
- All type files exported from barrel export for easy importing

**src/middleware.ts**

- Purpose: Next.js middleware runs on every request before route handlers
- Handles: Session refresh, route protection (/app/_ protected, /auth/_ redirected)
- Critical: Must not write logic between createServerClient and getUser() call

## Key File Locations

**Entry Points:**

- `src/app/page.tsx`: Landing page (public, shows location picker)
- `src/app/auth/login/page.tsx`: Login form (public)
- `src/app/app/[judet]/[localitate]/page.tsx`: Dashboard (protected, role-based)
- `src/app/admin/`: Super-admin panel routes (system-wide access)

**Configuration:**

- `src/middleware.ts`: Session management and route protection
- `next.config.ts`: CSP headers, image optimization, Sentry setup
- `tsconfig.json`: TypeScript config with strict mode enabled
- `src/lib/react-query.ts`: React Query defaults
- `src/components/providers/query-provider.tsx`: React Query provider wrapper

**Core Logic:**

- `src/lib/supabase/server.ts`: Server client factory
- `src/lib/supabase/client.ts`: Browser client factory
- `src/lib/auth/authorization.ts`: Auth guards and role checks
- `src/lib/validations/`: Zod schemas for all data validation
- `src/lib/location-storage.ts`: Location persistence logic

**Testing:**

- `tests/unit/`: Jest unit tests
- `tests/integration/`: Integration tests with Supabase
- `tests/e2e/`: Playwright end-to-end tests
- `jest.config.js`, `jest.integration.config.js`: Test configuration
- `playwright.config.ts`: E2E test configuration

## Naming Conventions

**Files:**

- Components: PascalCase (e.g., `LoginForm.tsx`, `CereriList.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useUserProfile.ts`, `useCereriList.ts`)
- Types: PascalCase (e.g., `api.ts`, `dashboard.ts`) but contents are PascalCase types
- Utils: camelCase (e.g., `location-storage.ts`, `rate-limiter.ts`)
- API routes: `route.ts` for all Route Handlers
- Tests: `.test.ts`, `.spec.ts` suffixes with `__tests__` directories

**Directories:**

- Kebab-case for multi-word names (e.g., `role-dashboards/`, `create-wizard/`)
- PascalCase for single-word feature domains (optional, used inconsistently)
- Dynamic segments in square brackets: `[judet]`, `[localitate]`, `[id]`
- Grouping folders in parentheses (e.g., `(admin)`, `(auth)`) when needed

**Exports:**

- Named exports preferred: `export function LoginForm() { ... }`
- Barrel exports in index.ts: `export * from './file'`
- Avoid default exports (makes refactoring harder)

**Imports:**

- Always use `@/` alias: `import { Button } from '@/components/ui/button'`
- Never use relative imports like `../../../`
- Group imports: stdlib → third-party → local (separated by blank lines)

## Where to Add New Code

**New Feature (e.g., "Surveys"):**

1. Create pages in `src/app/app/[judet]/[localitate]/sondaje/`
   - `page.tsx`: Feature main page (Server Component with data fetching)
   - `[id]/page.tsx`: Detail page
   - `create/page.tsx`: Creation wizard
2. Create components in `src/components/sondaje/`
   - `SurveyForm.tsx`: Main form (Client Component with form state)
   - `SurveyCard.tsx`: List item component
   - `SurveyWizard.tsx`: Multi-step wizard wrapper
3. Create API endpoints in `src/app/api/sondaje/`
   - `route.ts`: GET (list) and POST (create)
   - `[id]/route.ts`: GET (detail), PUT (update), DELETE
4. Create hook in `src/hooks/`
   - `useSurveyList.ts`: List with pagination/filtering
   - `useSurveyDetail.ts`: Single survey fetch
5. Create validations in `src/lib/validations/`
   - `surveys.ts`: Zod schemas for form validation
6. Create tests in `tests/`
   - `tests/unit/hooks/use-survey-list.test.ts`
   - `tests/e2e/surveys.spec.ts`

**New Component/Module:**

1. Create in appropriate `src/components/` subdirectory
2. If reusable UI primitive → `src/components/ui/`
3. If feature-specific → `src/components/[feature]/`
4. Export as named export
5. Add JSDoc comments for complex props

**Utilities/Helpers:**

- If domain-specific (auth, payments, etc.) → `src/lib/[domain]/`
- If general purpose → `src/lib/[utility-name].ts`
- Always export from index.ts in subdirectory for easier importing

**Hooks:**

- If data fetching → `src/hooks/use[EntityName].ts`
- If state management → `src/hooks/use[StateName].ts`
- If interaction → `src/hooks/use[InteractionName].ts`
- Always return tuple-like interface: `{ data, isLoading, isError, error }`

**API Routes:**

1. Create `src/app/api/[feature]/route.ts` for collection
2. Create `src/app/api/[feature]/[id]/route.ts` for detail
3. Follow pattern: Auth check → Validation → Authorization → Execution
4. Use service role client for public endpoints (surveys), regular client for user endpoints

## Special Directories

**src/app/api/**

- Purpose: Route Handlers (API endpoints)
- Generated: No (hand-written)
- Committed: Yes
- Pattern: Each file is a complete endpoint (GET, POST, PUT, DELETE in same file)
- Security: Authorization checks before data access

**src/app/[judet]/[localitate]/**

- Purpose: Location-scoped protected routes
- Generated: No
- Committed: Yes
- Pattern: Dynamic segments inherit location context from URL params
- Usage: RLS policies automatically filter data by this location

**src/types/database.types.ts**

- Purpose: Auto-generated TypeScript types for Supabase schema
- Generated: Yes (run `pnpm types:generate`)
- Committed: Yes
- Update: When Supabase schema changes, regenerate this file
- Usage: Import `Database` type for fully-typed Supabase queries

**public/**

- Purpose: Static assets served directly by CDN
- Generated: No
- Committed: Yes (only committed files should be here)
- Image optimization: Next.js Image component uses remotePatterns config
- Fonts: PP Neue Montreal custom fonts in `public/fonts/`

**tests/**

- Purpose: All test files (unit, integration, E2E)
- Generated: No (hand-written)
- Committed: Yes
- Structure: Mirror src/ structure for organization
- Run: `pnpm test` (unit), `pnpm test:integration`, `pnpm test:e2e`

**.planning/codebase/**

- Purpose: GSD (Get-Shit-Done) analysis output
- Generated: Yes (by Claude Code via `/gsd:map-codebase`)
- Committed: Yes
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md
- Usage: Read by `/gsd:plan-phase` and `/gsd:execute-phase` commands

**.docs/**

- Purpose: Project documentation (PRD, specs, implementation guides)
- Generated: No (hand-written)
- Committed: Yes
- Contents: Requirements, technical specs, deployment guides, Romanian documentation
- Audience: Developers, project managers, stakeholders

---

_Structure analysis: 2026-03-02_
