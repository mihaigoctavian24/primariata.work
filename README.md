# **primariaTa❤️_**

<div align="center">

🎓 **Proiect universitar în curs de dezvoltare** | [primariata.work](https://primariata.work) - primăria care lucrează pentru tine !

`Made with ❤️ by Bubu & Dudu Dev Team!`

</div>

---

## 🌟 Ce este primariaTa❤️_?

**primariaTa❤️_** este o platformă SaaS white-label care digitalizează complet procesele administrative locale din România. 

Imaginează-ți o primărie unde:

- 📱 **Depui cereri online** - fără cozi, fără hârtii, fără stres
- 🔍 **Urmărești solicitările** - în timp real, ca pe un colet eMAG
- 💳 **Plătești taxe digital** - rapid, securizat, fără deplasări
- 📄 **Descarci documente** - semnate digital, valabile legal
- 💬 **Comunici direct** - cu funcționarii, prin chat integrat

**Asta e primariaTa❤️_** - administrația publică așa cum ar trebui să fie: **rapidă, transparentă, accesibilă**.

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

### 🇷🇴 Documentație Oficială (Română)

**Pentru**: Profesori, comisie evaluare, stakeholderi, utilizatori finali

📍 **[Documentatie/](Documentatie/)** - Documentație oficială în limba română
- 📄 **[01-Prezentare/](Documentatie/01-Prezentare/)** - Viziune, misiune, obiective
- 📋 **[02-Cerinte/](Documentatie/02-Cerinte/)** - Specificații funcționale/nefuncționale
- 🏗️ **[03-Arhitectura/](Documentatie/03-Arhitectura/)** - Design sistem, diagrame
- 💻 **[04-Implementare/](Documentatie/04-Implementare/)** - Tehnologii, ghid dezvoltare
- 📖 **[05-Utilizare/](Documentatie/05-Utilizare/)** - Ghiduri pentru cetățeni, funcționari, admini
- 📎 **[06-Anexe/](Documentatie/06-Anexe/)** - Glossar, referințe, contribuitori

### 🇬🇧 Technical Documentation (English)

**Pentru**: Dezvoltatori, DevOps, QA Engineers

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

**📚 Navigation**: Vezi **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** pentru ghid complet de navigare

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

| Environment | URL | Branch | Purpose |
|-------------|-----|--------|---------|
| **Production** | https://primariata.work | `main` | Live pentru primării |
| **Staging** | https://develop.primariata.work | `develop` | Pre-production testing |
| **Preview** | Auto-generated per PR | `feature/*` | Feature review |

**CI/CD Pipeline** (GitHub Actions):
- ✅ Lint + TypeCheck + Tests on every push
- ✅ E2E tests on PR to `main`/`develop`
- ✅ Auto-deploy to Vercel on merge
- ✅ Database migrations via Supabase CLI

---

## 📊 Project Status & Roadmap

**Current Phase**: 🔴 **Phase 0 - Infrastructure Setup** (Week 1-2)

### Phase 0: Foundation (2 weeks)
- [ ] Development environment setup
- [ ] Supabase project + database migrations
- [ ] **Data seeding** (42 județe + 13,851 localități) ← **CRITICAL**
- [ ] Vercel deployment + Cloudflare security
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Sentry + Analytics)

### Phase 1: MVP Landing + Auth (Week 3-6)
- [ ] Landing page cu animații
- [ ] Location selection (județ + localitate)
- [ ] Authentication (email + Google OAuth)
- [ ] User dashboard (cetatean vs functionar)

### Phase 2: Cereri Module (Week 7-12)
- [ ] Request submission flow
- [ ] Document upload & management
- [ ] Request tracking & status updates
- [ ] Admin approval workflow

### Phase 3-5: Integrations + Advanced + Launch (Week 13-24)
- [ ] certSIGN digital signatures
- [ ] Ghișeul.ro payment integration
- [ ] Advanced features (plăți, transparență, sesizări)
- [ ] Production launch & onboarding

**Detailed Roadmap**: Vezi [IMPLEMENTATION_ROADMAP.md](.docs/03-implementation/IMPLEMENTATION_ROADMAP.md)

---

## 🤝 Contributing

### Git Workflow

1. **Create feature branch** from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** + commit:
   ```bash
   git add .
   git commit -m "feat: add location selection component"
   ```

3. **Push & create PR**:
   ```bash
   git push origin feature/your-feature-name
   # Then create PR on GitHub: feature/* → develop
   ```

4. **CI must pass** before merge (lint, tests, E2E)

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Build process, dependencies

### Code Style

- **TypeScript strict mode** enabled
- **ESLint** + **Prettier** enforced
- **File naming**: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- **Component structure**: Props interface → Component → Export

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
**Copyright**: © 2025 Bubu & Dudu Dev Team

### 🎓 Context Academic

**Universitate**: Universitatea Română-Americană
**Facultate**: Informatică Managerială
**Curs**: Programarea Aplicatiilor Web

### 👥 Contributori Principali (Owneri)

- **Octavian Mihai** - [mihai.g.octavian24@stud.rau.ro](mailto:mihai.g.octavian24@stud.rau.ro)
- **Bianca-Maria Abbasi Pazeyazd** - [abbasipazeyazd.h.biancamaria24@stud.rau.ro](mailto:abbasipazeyazd.h.biancamaria24@stud.rau.ro)

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

🚀 **Să digitalizăm România, cate o primărie odată!** 🚀

[Documentație](.docs/) • [Roadmap](.docs/03-implementation/IMPLEMENTATION_ROADMAP.md) • [Contributing](#-contributing) • [License](#-license--credits)

</div>
