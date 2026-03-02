# Technology Stack

**Analysis Date:** 2026-03-02

## Languages

**Primary:**

- TypeScript 5 - Entire codebase with strict mode enabled (`strict: true`)
- JavaScript (ES2017+ target) - React Server Components, Next.js configuration
- JSX/TSX - React component syntax

## Runtime

**Environment:**

- Node.js 20 (inferred from tsconfig `@types/node@^20`)
- Deno (for Supabase Edge Functions)

**Package Manager:**

- pnpm (referenced in scripts: `pnpm dev`, `pnpm build`, etc.)
- Lockfile: `pnpm-lock.yaml` (expected, not verified)

## Frameworks

**Core:**

- Next.js 15.5.9 - Full-stack React framework with App Router
- React 19.1.0 - Functional components, hooks-based

**Frontend/UI:**

- Tailwind CSS 4 - Utility-first styling with custom configuration
- shadcn/ui - Headless component library built on Radix UI
- Radix UI (via shadcn) - @radix-ui packages (18 components: dialog, select, tabs, etc.)
- Framer Motion 12.23.24 - Animations and motion effects
- GSAP 3.13.0 & @gsap/react 2.1.2 - Advanced animation library
- Three.js 0.180.0 & @react-three/fiber 9.4.0 - 3D rendering
- Lucide React 0.546.0 - Icon library

**State Management:**

- Zustand 5.0.8 - Global client state management
- React Query 5.90.5 (@tanstack/react-query) - Server state caching and synchronization
- React Hook Form 7.65.0 - Form state management
- Zod 4.1.12 - Schema validation and TypeScript inference

**Charts & Data Visualization:**

- Recharts 2.15.4 - React chart library
- @tremor/react 3.18.7 - Data visualization components
- @tanstack/react-virtual 3.13.12 - Virtual scrolling for large lists

**PDF & Document Processing:**

- pdf-lib 1.17.1 - PDF creation and manipulation
- jsPDF 3.0.3 - PDF generation from HTML/canvas
- html2canvas 1.4.1 - HTML to canvas rendering
- react-pdf 10.3.0 - PDF viewing in React
- ExcelJS 4.4.0 - Excel file generation
- xlsx 0.18.5 - Spreadsheet file parsing
- PapaParse 5.5.3 - CSV parsing
- JSZip 3.10.1 - ZIP file creation for batch downloads

**UI Utilities:**

- class-variance-authority 0.7.1 - Component styling patterns
- clsx 2.1.1 - Conditional className utility
- cmdk 1.1.1 - Command palette/search component
- Sonner 2.0.7 - Toast notification library
- isomorphic-dompurify 2.35.0 - HTML sanitization

**Other Libraries:**

- lodash 4.17.21 - Utility functions
- date-fns 4.1.0 - Date manipulation
- react-dropzone 14.3.8 - Drag-and-drop file uploads
- react-icons 5.5.0 - Icon library
- Fuse.js 7.1.0 - Fuzzy search
- @studio-freight/lenis 1.0.42 - Smooth scrolling
- next-themes 0.4.6 - Dark mode support
- use-debounce 10.0.6 - Debounce hook
- react-use-measure 2.1.7 - DOM measurement hook
- maath 0.10.8 - Math utilities
- motion 12.23.24 - Animation library
- postprocessing 6.37.8 - Post-processing effects

## Database

**Primary:**

- PostgreSQL 15 (hosted on Supabase)
- Supabase (Auth, Storage, Realtime, Edge Functions)
  - Client: @supabase/supabase-js 2.75.1
  - SSR: @supabase/ssr 0.7.0
  - Auth Helpers: @supabase/auth-helpers-nextjs 0.10.0

## Key Dependencies

**Critical:**

- @sentry/nextjs 10.21.0 - Error tracking and monitoring (production)
- openai 4.104.0 - AI text analysis and insights generation (GPT-4o-mini)

**Infrastructure:**

- @vercel/analytics 1.5.0 - User analytics on Vercel
- @vercel/speed-insights 1.2.0 - Web performance monitoring
- file-saver 2.0.5 - Browser file download utility

## Configuration

**Environment:**

- .env files (present, contents not specified)
- Environment variables for:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - `SUPABASE_SERVICE_ROLE_KEY` - Service role for admin operations
  - `OPENAI_API_KEY` - OpenAI API key
  - `SENTRY_DSN` - Sentry error tracking
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - SMS notifications
  - `SENDGRID_API_KEY` - Email service (via Edge Function)
  - `GHISEUL_MODE`, `GHISEUL_API_URL`, `GHISEUL_API_KEY`, `GHISEUL_WEBHOOK_SECRET` - Payments
  - `WEATHERAPI_API_KEY` - Weather data
  - `SENTRY_ORG`, `SENTRY_PROJECT` - Sentry configuration

**Build Configuration:**

- `tsconfig.json` - TypeScript strict mode, path aliases (`@/*` → `./src/*`)
- `next.config.ts - Security headers (CSP, HSTS, X-Frame-Options), image optimization, Sentry wrapper
- `tailwind.config.ts` - Custom theme with CSS variables, animations, custom spacing
- `postcss.config.mjs - Tailwind CSS PostCSS plugin
- `jest.config.js` - Jest unit test configuration
- `jest.integration.config.js` - Integration test configuration
- `playwright.config.ts` - E2E test configuration (6 browser profiles: chromium, firefox, webkit, mobile-chrome, mobile-safari, tablet)
- `eslint.config.mjs` - ESLint rules
- `commitlint.config.js` - Conventional commits validation
- `.husky/` - Git hooks (pre-commit, commit-msg)
- `sentry.server.config.ts` - Server-side Sentry initialization
- `sentry.edge.config.ts` - Edge Function Sentry configuration

## Testing Frameworks

**Unit Testing:**

- Jest 30.2.0 - Test runner
- @testing-library/react 16.3.0 - React component testing utilities
- @testing-library/jest-dom 6.9.1 - Jest matchers for DOM

**E2E Testing:**

- Playwright 1.56.1 - Browser automation and E2E testing
- 6 test projects: chromium, firefox, webkit, mobile-chrome, mobile-safari, tablet

**Performance Testing:**

- Lighthouse CI (@lhci/cli 0.15.1) - Performance metrics and assertions

## Security & Validation

**Linting & Formatting:**

- ESLint 9.38.0 - Code quality rules
- Prettier 3.6.2 - Code formatting
- prettier-plugin-tailwindcss 0.7.1 - Tailwind class sorting
- lint-staged 16.2.6 - Pre-commit linting

**Commit Validation:**

- Husky 9.1.7 - Git hooks manager
- @commitlint/cli 20.1.0 - Conventional commits validation

**Type Safety:**

- TypeScript 5 with strict compiler options:
  - `noUncheckedIndexedAccess`
  - `noImplicitReturns`
  - `noFallthroughCasesInSwitch`
  - `forceConsistentCasingInFileNames`

## Security Headers (Production)

Configured in `next.config.ts`:

- Content-Security-Policy (XSS protection)
- Strict-Transport-Security (HSTS, 2 years)
- X-Frame-Options: DENY (clickjacking protection)
- X-Content-Type-Options: nosniff (MIME sniffing protection)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera, microphone, geolocation, payment disabled
- X-XSS-Protection: 1; mode=block

## Development Tools

**CLI & Utilities:**

- dotenv 17.2.3 - Environment variable loading
- dotenv-cli 10.0.0 - CLI for .env loading
- tsx 4.20.6 - TypeScript execution for Node.js

## Deployment

**Hosting:**

- Vercel (inferred from next.config.ts analytics integration)
- CDN: Cloudflare (inferred from CSP header references)

**Build Process:**

- `pnpm build` - Next.js production build
- `pnpm start` - Production server start
- Source maps uploaded to Sentry during build

---

_Stack analysis: 2026-03-02_
