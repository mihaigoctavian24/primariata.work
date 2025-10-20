# primariaTa❤️\_ - System Architecture

<div align="center">

**Technical Architecture Documentation**

Comprehensive guide to the system design, data flow, and integration architecture of primariaTa❤️\_

[System Overview](#system-overview) • [Tech Stack](#technology-stack) • [Architecture Layers](#architecture-layers) • [Data Flow](#data-flow) • [Security](#security-architecture)

</div>

---

## Table of Contents

- [System Overview](#system-overview)
- [High-Level Architecture](#high-level-architecture)
- [Technology Stack](#technology-stack)
- [Architecture Layers](#architecture-layers)
  - [Presentation Layer](#presentation-layer)
  - [Application Layer](#application-layer)
  - [Data Layer](#data-layer)
  - [Integration Layer](#integration-layer)
- [Module Structure](#module-structure)
- [Data Flow](#data-flow)
  - [Request Flow](#request-flow)
  - [Authentication Flow](#authentication-flow)
  - [Document Upload Flow](#document-upload-flow)
- [Database Architecture](#database-architecture)
- [API Design](#api-design)
- [Integration Points](#integration-points)
- [Security Architecture](#security-architecture)
- [Performance & Scalability](#performance--scalability)
- [Deployment Architecture](#deployment-architecture)

---

## System Overview

**primariaTa❤️\_** is a modern **SaaS white-label platform** designed to digitalize Romanian local government administrative processes. Built on a **serverless, cloud-native architecture**, it leverages cutting-edge technologies to deliver a **secure, scalable, and performant** solution.

### Key Characteristics

| Characteristic | Implementation |
|---------------|----------------|
| **Architecture Pattern** | Serverless, Event-Driven, Multi-Tenant |
| **Deployment Model** | Edge-first, globally distributed |
| **Data Sovereignty** | EU-compliant (Frankfurt region) |
| **Scalability** | Auto-scaling, pay-per-use |
| **Security** | Multi-layer, zero-trust model |
| **Availability** | 99.9% SLA target |

### Design Principles

1. **🔐 Security First** - Multi-layer security, RLS, encryption at rest/transit
2. **⚡ Performance** - Edge computing, CDN, optimistic UI updates
3. **📈 Scalability** - Serverless auto-scaling, database connection pooling
4. **♿ Accessibility** - WCAG 2.1 AA compliance
5. **🌍 Multi-Tenancy** - Isolated data per municipality (județ + localitate)
6. **🔄 Resilience** - Graceful degradation, retry logic, circuit breakers

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Edge Layer - Cloudflare"
        CDN[Cloudflare CDN]
        WAF[Web Application Firewall]
        DDoS[DDoS Protection]
    end

    subgraph "Application Layer - Vercel Edge"
        NextJS[Next.js 15 App]
        Middleware[Auth Middleware]
        EdgeFunctions[Edge Functions]
    end

    subgraph "Backend Layer - Supabase"
        Auth[Supabase Auth]
        Database[(PostgreSQL 15)]
        Storage[Supabase Storage]
        Realtime[Realtime Subscriptions]
        EdgeAPI[Edge Functions Deno]
    end

    subgraph "External Integrations"
        CertSign[certSIGN API<br/>Digital Signatures]
        Ghiseul[Ghișeul.ro<br/>Payments]
        SendGrid[SendGrid<br/>Email]
        Twilio[Twilio<br/>SMS]
    end

    subgraph "Monitoring & Analytics"
        Sentry[Sentry<br/>Error Tracking]
        Vercel[Vercel Analytics<br/>Performance]
    end

    Browser --> CDN
    Mobile --> CDN
    CDN --> WAF
    WAF --> DDoS
    DDoS --> NextJS
    NextJS --> Middleware
    Middleware --> EdgeFunctions

    NextJS <-->|REST API| Auth
    NextJS <-->|GraphQL| Database
    NextJS <-->|File Upload| Storage
    NextJS <-->|WebSocket| Realtime
    NextJS --> EdgeAPI

    EdgeAPI --> CertSign
    EdgeAPI --> Ghiseul
    EdgeAPI --> SendGrid
    EdgeAPI --> Twilio

    NextJS --> Sentry
    NextJS --> Vercel

    classDef client fill:#e1f5ff,stroke:#01579b
    classDef edge fill:#fff3e0,stroke:#e65100
    classDef app fill:#f3e5f5,stroke:#4a148c
    classDef backend fill:#e8f5e9,stroke:#1b5e20
    classDef external fill:#fce4ec,stroke:#880e4f
    classDef monitoring fill:#fff9c4,stroke:#f57f17

    class Browser,Mobile client
    class CDN,WAF,DDoS edge
    class NextJS,Middleware,EdgeFunctions app
    class Auth,Database,Storage,Realtime,EdgeAPI backend
    class CertSign,Ghiseul,SendGrid,Twilio external
    class Sentry,Vercel monitoring
```

---

## Technology Stack

### Frontend Stack

```mermaid
graph LR
    subgraph "UI Framework"
        React[React 19.1.0<br/>UI Library]
        Next[Next.js 15.5.6<br/>Meta-Framework]
    end

    subgraph "Styling & Components"
        Tailwind[Tailwind CSS 4<br/>Utility CSS]
        Shadcn[shadcn/ui<br/>Component Library]
        Radix[Radix UI<br/>Primitives]
    end

    subgraph "State Management"
        Zustand[Zustand 5.0.8<br/>Global State]
        ReactQuery[React Query 5.90.5<br/>Server State]
    end

    subgraph "Form & Validation"
        RHF[React Hook Form 7.65.0<br/>Forms]
        Zod[Zod 4.1.12<br/>Validation]
    end

    subgraph "Animation"
        Framer[Framer Motion 12.23.24<br/>Animations]
    end

    Next --> React
    Shadcn --> Radix
    Shadcn --> Tailwind
    RHF --> Zod

    classDef core fill:#e3f2fd,stroke:#1565c0
    classDef ui fill:#fce4ec,stroke:#c2185b
    classDef state fill:#f3e5f5,stroke:#7b1fa2
    classDef form fill:#e8f5e9,stroke:#388e3c

    class React,Next core
    class Tailwind,Shadcn,Radix,Framer ui
    class Zustand,ReactQuery state
    class RHF,Zod form
```

### Backend Stack

```mermaid
graph TB
    subgraph "Supabase Platform"
        Postgres[(PostgreSQL 15<br/>Primary Database)]
        Auth[Supabase Auth<br/>JWT + OAuth]
        Storage[Supabase Storage<br/>S3-compatible]
        Realtime[Realtime Engine<br/>WebSocket]
        Functions[Edge Functions<br/>Deno Runtime]
    end

    subgraph "Security"
        RLS[Row Level Security<br/>Multi-Tenancy]
        Encryption[Encryption<br/>At Rest + Transit]
    end

    Auth --> Postgres
    Storage --> Postgres
    Realtime --> Postgres
    Functions --> Postgres
    RLS --> Postgres
    Encryption --> Postgres
    Encryption --> Storage

    classDef db fill:#e8f5e9,stroke:#2e7d32
    classDef service fill:#e1f5fe,stroke:#0277bd
    classDef security fill:#ffebee,stroke:#c62828

    class Postgres db
    class Auth,Storage,Realtime,Functions service
    class RLS,Encryption security
```

### Infrastructure Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Hosting** | Vercel (Frankfurt) | Serverless Next.js deployment |
| **CDN** | Cloudflare | Global content delivery |
| **Database** | Supabase (PostgreSQL 15) | Primary data store |
| **Auth** | Supabase Auth | Authentication & authorization |
| **Storage** | Supabase Storage | Document management |
| **Monitoring** | Sentry + Vercel Analytics | Error tracking + RUM |
| **DNS** | Cloudflare | DNS management |
| **Security** | Cloudflare WAF + DDoS | Protection layer |

---

## Architecture Layers

### Presentation Layer

**Responsibility**: User interface, client-side logic, routing

**Components:**
- **Next.js App Router** - File-based routing, Server Components
- **React Components** - UI elements (atomic design)
- **shadcn/ui** - Pre-built accessible components
- **Tailwind CSS** - Styling system

**Key Features:**
- ✅ Server-Side Rendering (SSR)
- ✅ Static Site Generation (SSG) for public pages
- ✅ Client-side navigation (SPA behavior)
- ✅ Progressive enhancement

**File Structure:**
```
src/app/
├── (auth)/              # Authentication routes (grouped)
│   ├── login/page.tsx
│   └── register/page.tsx
├── (public)/            # Public routes (grouped)
│   ├── page.tsx         # Landing page
│   └── [judet]/         # Location selection
│       └── [localitate]/page.tsx
└── app/                 # Authenticated app
    └── [judet]/         # Dynamic route (județul)
        └── [localitate]/ # Dynamic route (localitate)
            ├── dashboard/page.tsx
            ├── cereri/page.tsx
            └── plati/page.tsx
```

### Application Layer

**Responsibility**: Business logic, data fetching, state management

**Components:**
- **Route Handlers** (`/api/*`) - API endpoints
- **Server Actions** - Mutations from Server Components
- **Custom Hooks** - Reusable client logic
- **State Stores** - Zustand for global state

**Patterns:**
```typescript
// Server Component (data fetching)
export default async function DashboardPage() {
  const { data: requests } = await supabase
    .from('cereri')
    .select('*')
    .order('created_at', { ascending: false });

  return <RequestList requests={requests} />;
}

// Client Component (interactivity)
'use client';
export function RequestForm() {
  const { user } = useAuth();
  const mutation = useMutation(createRequest);
  // ...
}
```

### Data Layer

**Responsibility**: Data persistence, queries, business rules

**Components:**
- **PostgreSQL Database** - Relational data
- **Row Level Security (RLS)** - Multi-tenant isolation
- **Database Functions** - Business logic in SQL
- **Triggers** - Automated workflows

**Multi-Tenancy Model:**
```sql
-- Every table has județ + localitate for isolation
CREATE TABLE cereri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judet text NOT NULL,
  localitate text NOT NULL,
  user_id uuid REFERENCES auth.users,
  status text CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  -- RLS policy ensures users only see their county/city data
);

-- RLS Policy
CREATE POLICY "Users see only their locality data"
ON cereri FOR SELECT
USING (
  judet = current_setting('app.current_judet')
  AND localitate = current_setting('app.current_localitate')
);
```

### Integration Layer

**Responsibility**: External service communication, webhooks

**Components:**
- **Supabase Edge Functions** - Deno runtime
- **API Clients** - Third-party service wrappers
- **Webhook Handlers** - Payment/signature callbacks

**Integrations:**

```mermaid
graph LR
    App[primariaTa App]

    App -->|1. Generate Document| CertSign[certSIGN API]
    CertSign -->|2. Signed PDF| App

    App -->|1. Initiate Payment| Ghiseul[Ghișeul.ro API]
    Ghiseul -->|2. Payment Status| App

    App -->|Send Email| SendGrid[SendGrid API]
    App -->|Send SMS| Twilio[Twilio API]

    classDef app fill:#e3f2fd,stroke:#1565c0
    classDef external fill:#fff3e0,stroke:#e65100

    class App app
    class CertSign,Ghiseul,SendGrid,Twilio external
```

---

## Module Structure

### Core Modules

```
src/
├── app/                        # Next.js App Router (routes)
│   ├── layout.tsx              # Root layout (providers)
│   ├── page.tsx                # Landing page
│   ├── (auth)/                 # Auth module
│   ├── (public)/               # Public module
│   └── app/[judet]/[localitate]/ # Authenticated app module
│
├── components/                 # React components
│   ├── ui/                     # Base UI components (shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── dialog.tsx
│   ├── auth/                   # Auth components
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── cereri/                 # Request management components
│   │   ├── request-form.tsx
│   │   ├── request-list.tsx
│   │   └── request-detail.tsx
│   └── shared/                 # Shared components
│       ├── header.tsx
│       ├── footer.tsx
│       └── sidebar.tsx
│
├── lib/                        # Core utilities
│   ├── supabase/               # Supabase clients
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Middleware client
│   ├── validations/            # Zod schemas
│   │   ├── auth.ts
│   │   └── cereri.ts
│   └── utils/                  # Helper functions
│       ├── date.ts
│       ├── format.ts
│       └── utils.ts
│
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts
│   ├── use-requests.ts
│   └── use-payments.ts
│
├── store/                      # Zustand stores
│   ├── auth.ts
│   └── ui.ts
│
└── types/                      # TypeScript types
    ├── database.types.ts       # Generated from Supabase
    └── supabase.ts             # Supabase client types
```

---

## Data Flow

### Request Flow

Complete request lifecycle from browser to database:

```mermaid
sequenceDiagram
    participant B as Browser
    participant CF as Cloudflare CDN
    participant V as Vercel Edge
    participant M as Middleware
    participant SC as Server Component
    participant S as Supabase
    participant DB as PostgreSQL

    B->>CF: GET /dashboard
    CF->>V: Forward request
    V->>M: Check authentication
    M->>S: Verify JWT token
    S-->>M: User session valid
    M->>SC: Render dashboard
    SC->>S: Fetch requests (RLS applied)
    S->>DB: SELECT * FROM cereri WHERE judet=X AND localitate=Y
    DB-->>S: Filtered results
    S-->>SC: Return data
    SC-->>V: HTML response
    V-->>CF: Cache response (if applicable)
    CF-->>B: Render page

    Note over B,DB: Total time: <2.5s (LCP target)
```

### Authentication Flow

Complete authentication flow with OAuth support:

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant App as Next.js App
    participant SA as Supabase Auth
    participant Google as Google OAuth
    participant DB as PostgreSQL

    rect rgb(200, 230, 255)
        Note over U,DB: Email/Password Login
        U->>B: Click "Login"
        B->>App: POST /api/auth/login
        App->>SA: signInWithPassword()
        SA->>DB: Verify credentials
        DB-->>SA: User found
        SA-->>App: JWT + Refresh Token
        App-->>B: Set cookie (httpOnly)
        B-->>U: Redirect to /dashboard
    end

    rect rgb(255, 230, 200)
        Note over U,DB: Google OAuth Login
        U->>B: Click "Login with Google"
        B->>App: GET /api/auth/google
        App->>SA: signInWithOAuth({provider: 'google'})
        SA->>Google: OAuth redirect
        Google-->>U: Login prompt
        U->>Google: Approve
        Google-->>SA: Authorization code
        SA->>DB: Create/update user
        DB-->>SA: User record
        SA-->>App: JWT + Refresh Token
        App-->>B: Set cookie + redirect
        B-->>U: Dashboard
    end
```

### Document Upload Flow

Secure document upload with virus scanning and storage:

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant App as Next.js App
    participant SS as Supabase Storage
    participant DB as PostgreSQL
    participant EF as Edge Function

    U->>B: Select file
    B->>B: Client validation (size, type)
    B->>App: POST /api/upload (multipart)
    App->>App: Generate unique path
    App->>SS: Upload file to bucket
    SS->>SS: Virus scan (optional)
    SS-->>App: File URL
    App->>DB: INSERT INTO documents
    DB-->>App: Document record
    App->>EF: Trigger processing (if needed)
    EF->>SS: Process file (PDF generation, etc.)
    EF->>DB: Update document status
    App-->>B: Success + file URL
    B-->>U: Show uploaded file

    Note over U,DB: Files stored with RLS policies
```

---

## Database Architecture

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ CERERI : submits
    USERS ||--o{ PLATI : makes
    USERS ||--o{ NOTIFICATIONS : receives
    USERS }o--|| LOCALITATI : "belongs to"

    CERERI ||--|{ DOCUMENTS : contains
    CERERI ||--o| PLATI : "paid via"
    CERERI ||--o{ CERERI_HISTORY : tracks

    LOCALITATI ||--o{ CERERI : "receives"
    LOCALITATI }o--|| JUDETE : "part of"

    USERS {
        uuid id PK
        text email UK
        text full_name
        text role
        text judet FK
        text localitate FK
        timestamp created_at
    }

    CERERI {
        uuid id PK
        uuid user_id FK
        text judet FK
        text localitate FK
        text type
        text status
        jsonb data
        timestamp created_at
        timestamp updated_at
    }

    DOCUMENTS {
        uuid id PK
        uuid cerere_id FK
        text file_path
        text file_type
        int file_size
        text status
        timestamp created_at
    }

    PLATI {
        uuid id PK
        uuid user_id FK
        uuid cerere_id FK
        decimal amount
        text status
        text provider
        text transaction_id
        timestamp created_at
    }

    LOCALITATI {
        text id PK
        text judet FK
        text nume
        text tip
        int populatie
    }

    JUDETE {
        text id PK
        text nume
        text regiune
    }
```

### RLS Security Model

**Multi-Tenant Isolation** via Row Level Security:

```sql
-- Enable RLS on all tables
ALTER TABLE cereri ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users see only their locality data
CREATE POLICY "locality_isolation"
ON cereri FOR SELECT
USING (
  judet = (SELECT judet FROM auth.users WHERE id = auth.uid())
  AND localitate = (SELECT localitate FROM auth.users WHERE id = auth.uid())
);

-- Policy 2: Users see only their own requests
CREATE POLICY "user_owns_request"
ON cereri FOR SELECT
USING (user_id = auth.uid());

-- Policy 3: Functionar role can see all requests in their locality
CREATE POLICY "functionar_access"
ON cereri FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND role = 'functionar'
    AND judet = cereri.judet
    AND localitate = cereri.localitate
  )
);
```

### Indexes & Performance

**Optimized indexes** for common queries:

```sql
-- Composite index for multi-tenant queries
CREATE INDEX idx_cereri_locality ON cereri(judet, localitate, created_at DESC);

-- User-specific queries
CREATE INDEX idx_cereri_user ON cereri(user_id, status);

-- Full-text search
CREATE INDEX idx_cereri_search ON cereri USING gin(to_tsvector('romanian', data::text));

-- Status-based filtering
CREATE INDEX idx_cereri_status ON cereri(status, updated_at DESC);
```

---

## API Design

### REST API Structure

```
/api/
├── auth/
│   ├── login           POST   - Email/password login
│   ├── logout          POST   - Logout user
│   ├── register        POST   - Create account
│   └── google          GET    - OAuth redirect
│
├── cereri/
│   ├── [id]            GET    - Get request details
│   ├── [id]            PUT    - Update request
│   ├── [id]            DELETE - Delete request (draft only)
│   ├── list            GET    - List requests (filtered)
│   └── create          POST   - Create new request
│
├── documents/
│   ├── upload          POST   - Upload file
│   ├── [id]            GET    - Download file
│   └── [id]            DELETE - Delete file
│
├── plati/
│   ├── initiate        POST   - Start payment
│   ├── verify          GET    - Check payment status
│   └── webhook         POST   - Payment callback
│
└── webhooks/
    ├── certsign        POST   - certSIGN callback
    └── ghiseul         POST   - Ghișeul.ro callback
```

### API Response Format

**Standard response structure:**

```typescript
// Success response
{
  "success": true,
  "data": { /* payload */ },
  "meta": {
    "timestamp": "2025-01-18T10:30:00Z",
    "requestId": "req_abc123"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "constraint": "format"
    }
  },
  "meta": {
    "timestamp": "2025-01-18T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## Integration Points

### certSIGN Integration (Digital Signatures)

```mermaid
sequenceDiagram
    participant App
    participant EdgeFn as Edge Function
    participant CertSign as certSIGN API
    participant Storage as Supabase Storage

    App->>EdgeFn: POST /api/sign-document
    EdgeFn->>Storage: Get unsigned PDF
    Storage-->>EdgeFn: PDF bytes
    EdgeFn->>CertSign: POST /v1/sign
    Note over CertSign: User signs on certSIGN portal
    CertSign-->>EdgeFn: Signed PDF
    EdgeFn->>Storage: Upload signed PDF
    EdgeFn-->>App: Success + signed URL
```

**Configuration:**
```typescript
const certSignConfig = {
  apiUrl: process.env.CERTSIGN_API_URL,
  merchantId: process.env.CERTSIGN_MERCHANT_ID,
  apiKey: process.env.CERTSIGN_API_KEY,
  callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/certsign`,
};
```

### Ghișeul.ro Integration (Payments)

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Ghiseul as Ghișeul.ro API
    participant Webhook

    User->>App: Click "Pay Taxes"
    App->>Ghiseul: POST /v2/payments/init
    Ghiseul-->>App: Payment URL + ID
    App-->>User: Redirect to Ghișeul
    User->>Ghiseul: Complete payment
    Ghiseul->>Webhook: POST /api/webhooks/ghiseul
    Webhook->>App: Update payment status
    Webhook-->>Ghiseul: 200 OK
    Ghiseul-->>User: Redirect to success page
```

---

## Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Layer 1: Network Security"
        WAF[Cloudflare WAF]
        DDoS[DDoS Protection]
        RateLimit[Rate Limiting]
    end

    subgraph "Layer 2: Application Security"
        Auth[JWT Authentication]
        CSRF[CSRF Protection]
        CORS[CORS Policy]
        Headers[Security Headers]
    end

    subgraph "Layer 3: Data Security"
        RLS[Row Level Security]
        Encryption[Encryption at Rest]
        Transit[TLS 1.3]
        Validation[Input Validation]
    end

    subgraph "Layer 4: Compliance"
        GDPR[GDPR Compliance]
        Audit[Audit Logging]
        Backup[Encrypted Backups]
    end

    WAF --> Auth
    DDoS --> Auth
    RateLimit --> Auth
    Auth --> RLS
    CSRF --> RLS
    CORS --> RLS
    Headers --> RLS
    RLS --> GDPR
    Encryption --> GDPR
    Transit --> GDPR
    Validation --> GDPR
    GDPR --> Audit
    Audit --> Backup

    classDef network fill:#ffebee,stroke:#c62828
    classDef app fill:#e3f2fd,stroke:#1565c0
    classDef data fill:#e8f5e9,stroke:#2e7d32
    classDef compliance fill:#f3e5f5,stroke:#6a1b9a

    class WAF,DDoS,RateLimit network
    class Auth,CSRF,CORS,Headers app
    class RLS,Encryption,Transit,Validation data
    class GDPR,Audit,Backup compliance
```

### Authentication & Authorization

**JWT Flow:**
```typescript
// 1. User logs in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// 2. JWT stored in httpOnly cookie
document.cookie = `access_token=${data.session.access_token}; httpOnly; secure; sameSite=strict`;

// 3. Middleware validates on every request
export async function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token');
  const { data: { user } } = await supabase.auth.getUser(token);

  if (!user) {
    return NextResponse.redirect('/login');
  }

  return NextResponse.next();
}
```

---

## Performance & Scalability

### Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | SSR, Image optimization, CDN |
| **FCP** (First Contentful Paint) | < 1.2s | Critical CSS, Font optimization |
| **TTI** (Time to Interactive) | < 3.5s | Code splitting, Progressive enhancement |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Reserved space, Font loading |

### Scalability Strategy

**Horizontal Scaling:**
- ✅ Serverless functions (auto-scale)
- ✅ CDN edge nodes (300+ locations)
- ✅ Database read replicas (Supabase)
- ✅ Connection pooling (PgBouncer)

**Caching Strategy:**
```mermaid
graph LR
    Browser[Browser Cache<br/>Static assets]
    CDN[Cloudflare CDN<br/>HTML, CSS, JS]
    Edge[Vercel Edge<br/>API responses]
    Database[PostgreSQL<br/>Query results]

    Browser -->|Miss| CDN
    CDN -->|Miss| Edge
    Edge -->|Miss| Database

    classDef cache fill:#e8f5e9,stroke:#2e7d32

    class Browser,CDN,Edge,Database cache
```

---

## Deployment Architecture

### Environments

```mermaid
graph LR
    subgraph "Development"
        Local[Local<br/>localhost:3000]
    end

    subgraph "Staging"
        Preview[Vercel Preview<br/>develop.primariata.work]
    end

    subgraph "Production"
        Prod[Production<br/>primariata.work]
    end

    Local -->|Push to feature/*| Preview
    Preview -->|Merge to develop| Preview
    Preview -->|Merge to main| Prod

    classDef dev fill:#e3f2fd,stroke:#1565c0
    classDef staging fill:#fff3e0,stroke:#e65100
    classDef prod fill:#e8f5e9,stroke:#2e7d32

    class Local dev
    class Preview staging
    class Prod prod
```

### CI/CD Pipeline

```mermaid
graph TB
    subgraph "GitHub Actions"
        Push[Push to GitHub]
        Lint[Lint & Type Check]
        Test[Unit Tests]
        Build[Build Application]
        E2E[E2E Tests]
        Deploy[Deploy to Vercel]
    end

    Push --> Lint
    Lint --> Test
    Test --> Build
    Build --> E2E
    E2E --> Deploy

    classDef success fill:#e8f5e9,stroke:#2e7d32
    classDef process fill:#e3f2fd,stroke:#1565c0

    class Push,Lint,Test,Build,E2E process
    class Deploy success
```

### Infrastructure Providers

| Service | Provider | Region | Purpose |
|---------|----------|--------|---------|
| **Hosting** | Vercel | Frankfurt (eu-central-1) | Next.js app |
| **Database** | Supabase | Frankfurt (eu-central-1) | PostgreSQL |
| **CDN** | Cloudflare | Global (300+ PoPs) | Static assets |
| **DNS** | Cloudflare | Global | Domain management |
| **Monitoring** | Sentry | EU (Frankfurt) | Error tracking |

---

<div align="center">

**Complete Architecture Documentation** 

For implementation details, please see [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)

**Made with ❤️ by Bubu & Dudu Dev Team**

</div>
