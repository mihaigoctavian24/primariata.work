# **primariaTa❤️\_**

<div align="center">

🎓 **Proiect universitar în curs de dezvoltare** | [primariata.work](https://primariata.work) - primăria care lucrează pentru tine !

`Made with ❤️ by Bubu & Dudu Dev Team!`

---

[![Deploy Status](https://img.shields.io/github/deployments/mihaigoctavian24/primariata.work/production?label=Vercel&logo=vercel)](https://primariata.work)
[![Build Status](https://img.shields.io/github/actions/workflow/status/mihaigoctavian24/primariata.work/ci.yml?branch=main&label=CI/CD)](https://github.com/mihaigoctavian24/primariata.work/actions)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015-green.svg?logo=supabase)](https://supabase.com/)
[![Code Style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

</div>

---

## 🌟 Ce este primariaTa❤️\_?

**primariata.work** este o platformă SaaS white-label care digitalizează complet procesele administrative locale din România.

Imaginează-ți o primărie unde:

- 📱 **Depui cereri online** - fără cozi, fără hârtii, fără stres
- 🔍 **Urmărești solicitările** - în timp real, ca pe un colet eMAG
- 💳 **Plătești taxe digital** - prin Ghișeul.ro, chitanță automată, instant
- ✍️ **Semnezi documente digital** - certSIGN, legal, fără imprimantă
- 📄 **Descarci documente** - semnate digital, valabile legal
- 📧 **Primești notificări** - email și SMS pentru fiecare update
- 💬 **Comunici direct** - cu funcționarii, prin chat integrat

**Asta e primariaTa❤️\_** - administrația publică așa cum ar trebui să fie: **rapidă, transparentă, accesibilă**.

---

## 🚀 Quick Start

### Prerequisite (ce îți trebuie)

Verifică că ai instalate:

- **Node.js 20+** - [Descarcă aici](https://nodejs.org/)
- **pnpm 8+** - `npm install -g pnpm`
- **Supabase CLI** - `brew install supabase/tap/supabase` (macOS) sau `npm install -g supabase`
- **Git** - pentru clone & versioning

### Setup în 5 minute ⚡

```bash
# 1. Clone repo-ul
git clone https://github.com/mihaigoctavian24/primariata.work.git
cd primariata.work

# 2. Instalează dependințele
pnpm install

# 3. Configurează environment variables
cp .env.example .env.local
# Editează .env.local cu credentials-urile tale de Supabase

# 4. Pornește development server
pnpm dev

# 🎉 Gata! Deschide http://localhost:3000
```

---

## 📂 Structura Proiectului

```
primariata.work/
├── .docs/                          # 📚 Documentație tehnică completă
│   ├── 01-requirements/            # PRD, business case, usage scenarios
│   ├── 02-technical-specs/         # Database, API, Infrastructure, Security
│   ├── 03-implementation/          # Roadmap detaliat (Phase 0-5)
│   ├── 04-mock-services/           # Mock APIs pentru development
│   └── 05-quality/                 # Testing, Performance, Error Handling
│
├── src/
│   ├── app/                        # Next.js 14 App Router
│   │   ├── (auth)/                 # Login, Register
│   │   ├── (public)/               # Landing page, Location selection
│   │   └── app/[judet]/[localitate]/ # Authenticated app (Dashboard, Cereri, etc.)
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── auth/                   # Authentication components
│   │   ├── cereri/                 # Request management
│   │   └── shared/                 # Reusable components
│   ├── lib/
│   │   ├── supabase/               # Supabase clients (browser, server, middleware)
│   │   ├── validations/            # Zod schemas
│   │   └── utils/                  # Helper functions
│   ├── types/                      # TypeScript type definitions
│   ├── hooks/                      # Custom React hooks
│   └── store/                      # Zustand global state
│
├── supabase/
│   ├── migrations/                 # Database migrations (SQL)
│   ├── functions/                  # Edge Functions (Deno)
│   └── seed.sql                    # Development seed data
│
├── tests/
│   ├── e2e/                        # Playwright end-to-end tests
│   ├── integration/                # Integration tests
│   └── unit/                       # Jest unit tests
│
├── scripts/
│   └── import-localitati.ts        # Import județe + localități (13,851 entries)
│
└── .supabase/
    └── localitati.json             # ✅ 13,851 localități ready to import
```

---

## 🎯 Tech Stack

**Frontend**:

- ⚛️ **Next.js 14** - App Router, Server Components, Route Handlers
- 🎨 **Tailwind CSS** + **shadcn/ui** - Modern, accessible UI components
- 📝 **TypeScript 5** - Type safety everywhere
- ✨ **Framer Motion** - Smooth animations
- 📋 **React Hook Form** + **Zod** - Form validation
- 🔄 **Zustand** + **React Query** - State management

**Backend**:

- 🐘 **Supabase** - PostgreSQL 15 + Auth + Storage + Realtime
- 🔐 **Row Level Security (RLS)** - Multi-tenancy isolation
- 🔑 **JWT Authentication** - Email + Google OAuth
- 📦 **Supabase Storage** - Document management
- ⚡ **Edge Functions** - PDF generation, webhooks, notifications

**Infrastructure**:

- 🚀 **Vercel** - Hosting (Frankfurt region)
- 🌐 **Cloudflare** - DNS + CDN + WAF + DDoS protection
- 📊 **Sentry** - Error tracking
- 📈 **Vercel Analytics** - Real User Monitoring

**Integrări**:

- ✍️ **certSIGN** - Semnături digitale certificate
- 💳 **Ghișeul.ro** - Plăți online taxe locale
- 📧 **SendGrid** - Email transactional
- 📱 **Twilio** - SMS notifications

---

## 📖 Documentație

**🗂️ Avem DOUĂ tipuri de documentație** - vezi [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) pentru detalii:

### 👨‍💻 Developer Documentation (Start Here!)

**Pentru**: Dezvoltatori noi, contributori, code reviewers

**🚀 Essential Guides:**

1. **[CONTRIBUTING.md](CONTRIBUTING.md)** - Git workflow, code standards, PR process (comprehensive guide)
2. **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Daily workflows, common tasks with code examples
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design, data flow, technology stack
4. **[Pull Request Template](.github/pull_request_template.md)** - PR checklist and structure

**📋 Issue Templates:**

- **[Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)** - Report bugs with comprehensive details
- **[Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)** - Propose new features

### 🇷🇴 Documentație Oficială (Română)

**Pentru**: Profesori, comisie evaluare, stakeholderi, utilizatori finali

📍 **[docs/](docs/)** - Documentație oficială în limba română

- 📄 **[01-Prezentare/](docs/01-Prezentare/)** - Viziune, misiune, obiective
- 📋 **[02-Cerinte/](docs/02-Cerinte/)** - Specificații funcționale/nefuncționale
- 🏗️ **[03-Arhitectura/](docs/03-Arhitectura/)** - Design sistem, diagrame
- 💻 **[04-Implementare/](docs/04-Implementare/)** - Tehnologii, ghid dezvoltare
- 📖 **[05-Utilizare/](docs/05-Utilizare/)** - Ghiduri pentru cetățeni, funcționari, admini
- 📎 **[06-Anexe/](docs/06-Anexe/)** - Glossar, referințe, contribuitori

### 🇬🇧 Technical Specifications (Advanced)

**Pentru**: Arhitecți, DevOps, QA Engineers, Security Specialists

📍 **`.docs/`** - Technical specs (gitignored, 804KB)

**Start Here** 👇

1. **[PRD Complete](.docs/01-requirements/PRD_Primariata_Complete.md)** - Business case, features, usage scenarios (2-45 min read)
2. **[Implementation Roadmap](.docs/03-implementation/IMPLEMENTATION_ROADMAP.md)** - Phase 0-5 cu task-uri detaliate

**Pentru Dezvoltatori** 🛠️

- **[Database Schema](.docs/02-technical-specs/TECH_SPEC_Database.md)** - Tabele, RLS policies, indexes, triggers
- **[API Specification](.docs/02-technical-specs/TECH_SPEC_API.md)** - Endpoint contracts, auth flows
- **[Infrastructure Setup](.docs/02-technical-specs/TECH_SPEC_Infrastructure.md)** - Vercel, Supabase, Cloudflare config
- **[Security Architecture](.docs/02-technical-specs/TECH_SPEC_Security.md)** - Multi-layer security, GDPR compliance

**Pentru QA** 🧪

- **[Testing Strategy](.docs/05-quality/TESTING_STRATEGY.md)** - Unit, Integration, E2E, Accessibility tests
- **[Performance Budgets](.docs/05-quality/PERFORMANCE.md)** - LCP <2.5s, FCP <1.2s, TTI <3.5s
- **[Error Handling](.docs/05-quality/ERROR_HANDLING.md)** - Taxonomy, retry logic, user feedback

---

**📚 Full Navigation**: Vezi **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** pentru ghid complet de navigare

---

## 🧪 Testing & Quality

```bash
# Unit tests (Jest + React Testing Library)
pnpm test

# Integration tests
pnpm test:integration

# E2E tests (Playwright)
pnpm test:e2e

# Accessibility tests (axe-core)
pnpm test:a11y

# Type checking
pnpm type-check

# Linting & Formatting
pnpm lint
pnpm format:check
pnpm format:write
```

**Quality Standards**:

- ✅ **WCAG 2.1 AA** compliance (accessibility)
- ✅ **95%+ test coverage** (unit + integration)
- ✅ **100% E2E coverage** for critical flows
- ✅ **Performance budgets** enforced (Lighthouse CI)

---

## 🚢 Deployment & Environments

| Environment    | URL                             | Branch      | Purpose                |
| -------------- | ------------------------------- | ----------- | ---------------------- |
| **Production** | https://primariata.work         | `main`      | Live pentru primării   |
| **Staging**    | https://develop.primariata.work | `develop`   | Pre-production testing |
| **Preview**    | Auto-generated per PR           | `feature/*` | Feature review         |

**CI/CD Pipeline** (GitHub Actions):

- ✅ Lint + TypeCheck + Tests on every push
- ✅ E2E tests on PR to `main`/`develop`
- ✅ Auto-deploy to Vercel on merge
- ✅ Database migrations via Supabase CLI

---

## 📊 Project Status & Roadmap

**Status actual**: Ianuarie 2026 (An universitar 2025-2026)
**Progres general**: 43 issues închise din 101 totale = **42.6%**

### 📈 Milestones Overview (GitHub)

| Milestone                    | Progress        | Status       | Due Date    | Completed   |
| ---------------------------- | --------------- | ------------ | ----------- | ----------- |
| **M1: Landing & Auth 🚀**    | 20✅ / 21 total | ✅ **95.2%** | 28 Oct 2025 | 26 Dec 2025 |
| **M7: Survey Platform**      | 1✅ / 1 total   | ✅ **100%**  | 31 Oct 2025 | -           |
| **M2: Cereri Module 📋**     | 10✅ / 10 total | ✅ **100%**  | 1 Nov 2025  | 1 Jan 2026  |
| **M3: Integrations 💳**      | 8✅ / 8 total   | ✅ **100%**  | 8 Nov 2025  | 7 Jan 2026  |
| **M4: Advanced Features ✨** | 0✅ / 14 total  | ⏳ 0%        | 15 Nov 2025 | -           |
| **M5: Production Launch 🚀** | 0✅ / 13 total  | ⏳ 0%        | 22 Nov 2025 | -           |
| **M6: Documentation 📚**     | 0✅ / 22 total  | ⏳ 0%        | 29 Nov 2025 | -           |

### ✅ M1: Landing Page & Authentication (100% - COMPLETE ✅)

**Completed Date:** 26 December 2025
**All Tasks (21/21) - 100% Complete:**

**Core Features:**

- [x] Landing page design cu animații WebGL
- [x] Location selection (județ + localitate cu 13,851 entries)
- [x] Google OAuth integration
- [x] Email/Password authentication
- [x] Register Page cu Validation
- [x] Password Reset Flow
- [x] User Dashboard Layout
- [x] User Profile Page
- [x] Footer cu Navigation Links & Social Media

**Infrastructure & Quality:**

- [x] Database schema (13 tables cu RLS)
- [x] Vercel deployment + Cloudflare security
- [x] CI/CD pipeline (GitHub Actions)
- [x] Monitoring (Sentry + Analytics)
- [x] Performance Optimization (Lighthouse audit, Image optimization)
- [x] Accessibility Testing (96% score)
- [x] Responsive Design Testing (Mobile, Tablet, Desktop)

**Documentation & Code Quality:**

- [x] Developer documentation (CONTRIBUTING.md, ARCHITECTURE.md)
- [x] Git hooks (Husky + lint-staged + commitlint)
- [x] Unit Tests pentru Auth Components
- [x] E2E Tests pentru Auth Flow
- [x] M1 Completion Report (see `claudedocs/m1-completion/`)

**📊 Quality Metrics:**

- ✅ Accessibility: 96% (Target: 100%)
- ✅ Best Practices: 96% (Target: ≥95%)
- ✅ SEO: 91% (Target: ≥90%)
- ⚠️ Performance: 41% in dev mode (Production build will improve to ≥90%)
- ✅ TypeScript: 0 errors
- ✅ ESLint: 6 warnings (non-critical)

### ✅ M7: Survey Platform (100% - Complete)

**Completate (1/1)**:

- [x] Survey system multi-step (5 pași, 25+ întrebări)
- [x] Admin dashboard cu analytics
- [x] Export date (CSV, JSON, XLSX, PDF)

### ✅ M2: Cereri Module (100% - COMPLETE ✅)

**Completed Date:** 1 January 2026
**All Tasks (9/9) - 100% Complete:**

**Core Features:**

- [x] Database schema pentru cereri (15+ tipuri cereri, RLS policies)
- [x] API Routes - CRUD operations cu validare Zod
- [x] Cereri List Page cu filters, search, pagination
- [x] Create New Cerere - Multi-step wizard form
- [x] Cerere Details Page cu status timeline
- [x] Document Upload/Download Management (Supabase Storage)
- [x] Real-Time Notifications pentru status updates
- [x] Email Notifications (SendGrid + Edge Functions)
- [x] Playwright E2E Tests pentru Cereri Flow (11 scenarios)

**📄 Documentation:**

- ✅ See [M2 Completion Report](docs/M2_COMPLETION_REPORT.md) for details
- ✅ See [M3 Handoff Document](docs/M3_HANDOFF.md) for next steps

**📊 Quality Metrics:**

- ✅ 11 E2E test scenarios passing
- ✅ Full email notification system operational
- ✅ Real-time updates implemented
- ✅ Document management with Supabase Storage
- ✅ Efficiency: 51 actual hours vs 74 estimated (31% gain)

### ✅ M3: Integrations & Payments (100% - COMPLETE ✅)

**Completed Date:** 7 January 2026
**All Tasks (8/8) - 100% Complete:**

**Payment System 💳:**

- [x] Database schema pentru plăți și chitanțe (4 tables, 6 RLS policies)
- [x] Mock Ghișeul.ro payment gateway simulator (4 API routes)
- [x] Payment API routes - Create, webhook, list, download receipt (5 routes)
- [x] Payment UI components - InitiateModal, StatusCard, HistoryList (4 components)
- [x] Automatic chitanță (receipt) generation on successful payment
- [x] Multi-step payment flow: initiate → process → webhook → chitanță

**Digital Signature System ✍️:**

- [x] Database schema pentru certificates și signature audit log (2 tables)
- [x] PDF signature watermark utilities (pdf-lib integration)
- [x] Mock certSIGN API - certificates, validation, signing, verification (8 routes)
- [x] Signature API endpoints - single, batch, verify (with service abstraction)
- [x] Signature UI components - SignaturePreview, BatchModal, CertificateSelector (5 components)
- [x] Integration with cerere approval flow (sign approved documents)

**Notifications 📧📱:**

- [x] Email notification system (SendGrid Edge Function) - 8 templates
- [x] SMS notification system (Twilio Edge Function) - 9 templates
- [x] Templates: payment events, signature events, cerere status updates

**Testing & Monitoring 🧪:**

- [x] Integration tests for payment workflow (566 lines, 9 test cases)
- [x] Integration tests for signature workflow (554 lines, 11 test cases)
- [x] Production monitoring setup (Sentry, Vercel Analytics, health checks)
- [x] Custom error contexts for payments and signatures
- [x] Alert rules and incident response procedures

**📄 Documentation:**

- ✅ See [M3 Completion Report](claudedocs/M3_COMPLETION_REPORT.md) for comprehensive status
- ✅ See [M4 Handoff Document](claudedocs/M4_HANDOFF.md) for next phase preparation
- ✅ See [Integration Monitoring Guide](.docs/05-quality/MONITORING_INTEGRATION_GUIDE.md) for Sentry setup

**📊 Quality Metrics:**

- ✅ 20 integration tests (100% passing) - certSIGN (11), Ghișeul.ro (9)
- ✅ Response time tracking with Sentry metrics
- ✅ Monitoring infrastructure operational (target: <2000ms)
- ✅ Success rate monitoring by integration and operation
- ✅ Error capture with full context

**✅ All Issues Complete (8/8):**

- ✅ #79: certSIGN API Integration
- ✅ #80: Ghișeul.ro Payment Gateway
- ✅ #81: Payment Database Schema
- ✅ #82: Payment List Page with History
- ✅ #83: SendGrid Transactional Emails
- ✅ #84: Twilio SMS Notifications
- ✅ #85: Integration Tests + Monitoring
- ✅ #86: M3 Completion Checklist & Handoff

**🟡 Production Readiness:**

- ✅ Mock services fully functional for offline development
- ✅ Integration tests passing (certSIGN: 11 tests, Ghișeul.ro: 9 tests)
- ✅ Monitoring infrastructure configured (Sentry + metrics)
- 🟡 Awaiting production credentials (certSIGN, Ghișeul.ro)
- ✅ Email/SMS systems production-ready (SendGrid, Twilio)

### ⏳ M4-M6: Următoarele Faze (Planificate)

**M4: Advanced Features** (0% - Due 15 Nov):

- Advanced features (plăți, transparență, sesizări)

**M5: Production Launch** (0% - Due 22 Nov):

- Production launch & onboarding

**M6: Documentation** (0% - Due 29 Nov):

- Documentație oficială română completă

**Detailed Roadmap**: Vezi [GitHub Milestones](https://github.com/mihaigoctavian24/primariata.work/milestones)

---

## 🤝 Contributing

**We welcome contributions!** Please read our comprehensive guides before contributing:

📖 **[CONTRIBUTING.md](CONTRIBUTING.md)** - Complete guide covering:

- Code of Conduct
- Getting Started (fork, clone, setup)
- Development Workflow (Git Flow, branching strategy)
- Code Standards (TypeScript, React, naming conventions)
- Testing Requirements (unit, integration, E2E)
- Pull Request Process
- Code Review Guidelines

### Quick Start for Contributors

1. **Fork & Clone**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/primariata.work.git
   cd primariata.work
   pnpm install
   ```

2. **Create Feature Branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes** following our [code standards](CONTRIBUTING.md#code-standards)

4. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):

   ```bash
   git commit -m "feat(scope): description"
   ```

5. **Create Pull Request** using our [PR template](.github/pull_request_template.md)

### Code Quality Checks

Before submitting your PR, ensure:

- ✅ `pnpm lint` passes
- ✅ `pnpm type-check` passes
- ✅ `pnpm test` passes (90%+ coverage)
- ✅ `pnpm format:check` passes
- ✅ Pre-commit hooks pass (Husky + lint-staged)

**For detailed guidelines**, see **[CONTRIBUTING.md](CONTRIBUTING.md)**

---

## 🎓 Learning Resources

### Pentru Începători

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Video Tutorials

- [Next.js App Router Crash Course](https://www.youtube.com/watch?v=NgayZAuTgwM)
- [Supabase Auth with Next.js](https://www.youtube.com/watch?v=_XM9ziOzWk4)
- [Tailwind CSS Full Course](https://www.youtube.com/watch?v=pfaSUYaSgRo)

---

## 🐛 Troubleshooting

### Common Issues

**Problem**: `pnpm install` fails

```bash
# Solution: Clear cache and retry
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Problem**: Supabase connection error

```bash
# Solution: Check .env.local has correct credentials
# Verify: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Problem**: TypeScript errors after migration

```bash
# Solution: Regenerate types from database
pnpm types:generate
```

**Problem**: E2E tests failing locally

```bash
# Solution: Install Playwright browsers
pnpm playwright install --with-deps
```

---

## 📝 License & Credits

**License**: Proprietary - Proiect universitar
**Copyright**: © 2025-2026 Bubu & Dudu Dev Team

### 🎓 Context Academic

**Universitate**: Universitatea Română-Americană
**Facultate**: Informatică Managerială
**Curs**: Programarea Aplicatiilor Web
**An universitar**: 2025-2026

### 👥 Contributori Principali (Owneri)

- **Octavian Mihai** - Full-Stack Developer - [mihai.g.octavian24@stud.rau.ro](mailto:mihai.g.octavian24@stud.rau.ro)
  - Frontend, Backend, DevOps, UI/UX, Documentație Tehnică
- **Bianca-Maria Abbasi Pazeyazd** - Frontend Developer & UI/UX Designer - [abbasipazeyazd.h.biancamaria24@stud.rau.ro](mailto:abbasipazeyazd.h.biancamaria24@stud.rau.ro)
  - Design UI/UX, Frontend, QA, Documentație Oficială

### 👨‍🏫 Coordonare Academică

- **Prof. Andrei Luchici** - [andrei.luchici@rau.ro](mailto:andrei.luchici@rau.ro)

### Built With ❤️ Using

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Hosting platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

## 🎉 Special Thanks

Mulțumim tuturor celor care au contribuit la acest proiect:

- 👨‍🏫 **Profesorilor** - pentru îndrumare și suport
- 👥 **Colegilor** - pentru feedback și testing
- 🏛️ **Primăriilor** - pentru input despre procese reale
- 🌐 **Open Source Community** - pentru tools incredibile

---

## 📧 Contact

**Questions? Feedback? Want to contribute?**

### Owneri Proiect

- 📧 **Octavian Mihai**: [mihai.g.octavian24@stud.rau.ro](mailto:mihai.g.octavian24@stud.rau.ro)
- 📧 **Bianca-Maria Abbasi Pazeyazd**: [abbasipazeyazd.h.biancamaria24@stud.rau.ro](mailto:abbasipazeyazd.h.biancamaria24@stud.rau.ro)

### Coordonare Academică

- 📧 **Prof. Andrei Luchici**: [andrei.luchici@rau.ro](mailto:andrei.luchici@rau.ro)

### Alte Canale

- 💬 GitHub Issues: [Create an issue](https://github.com/mihaigoctavian24/primariata.work/issues)
- 🌐 Website: [primariata.work](https://primariata.work)

---

<div align="center">

**Made with ❤️ by Bubu & Dudu Dev Team**

🚀 **Să digitalizăm România, câte o primărie odată!** 🚀

---

### 📚 Quick Links

[Contributing](CONTRIBUTING.md) • [Development Guide](DEVELOPMENT_GUIDE.md) • [Architecture](ARCHITECTURE.md) • [Roadmap](.docs/03-implementation/IMPLEMENTATION_ROADMAP.md) • [Issues](https://github.com/mihaigoctavian24/primariata.work/issues)

---

**⭐ If you find this project useful, please give it a star!**

[![GitHub stars](https://img.shields.io/github/stars/mihaigoctavian24/primariata.work?style=social)](https://github.com/mihaigoctavian24/primariata.work/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mihaigoctavian24/primariata.work?style=social)](https://github.com/mihaigoctavian24/primariata.work/network/members)

</div>
