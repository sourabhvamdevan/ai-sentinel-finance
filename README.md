# AI Sentinel Finance

An AI-powered financial intelligence platform built for the AI Hackathon. AI Sentinel Finance uses Gemini and LangChain to turn raw transaction data into actionable insights, with automated budgeting, smart receipt scanning, and real-time financial health monitoring.

**Live Demo:** `https://your-app.vercel.app`

---

## Hackathon Submission: AI-Based Finance Project

AI Sentinel Finance bridges the gap between manual expense tracking and automated financial literacy. It combines Prisma for reliable data modeling, LangChain for AI orchestration, and Arcjet for security and rate limiting, giving users a secure, scalable and intelligent personal finance assistant.

### Core AI Features

* **Smart Receipt Extraction**: Upload a receipt image and Gemini extracts the amount, merchant, date and category automatically.
* **Automated Categorization**: AI-driven classification of expenses into logical spending categories.
* **Predictive Insights**: LangChain-powered analysis of spending habits to help users optimize their monthly budget.
* **AI Financial Advisor**: Personalized, data-driven recommendations generated through structured AI chains, with a rule-based fallback when the AI is unavailable.
* **Monthly Reports and Budget Alerts**: Scheduled background jobs (Inngest) generate AI-written monthly summaries and email alerts when spending nears the budget.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS, Shadcn UI |
| Database | PostgreSQL with Prisma ORM |
| Auth | Clerk |
| AI Orchestration | LangChain.js |
| Model | Gemini 2.5 Flash |
| Background Jobs | Inngest |
| Email | Resend |
| Security | Arcjet (bot protection, shield, rate limiting) |
| Deployment | Vercel (Docker also supported) |

---

## Architecture

All diagrams below are written in Mermaid and render automatically on GitHub.

### 1. System Overview

```mermaid
flowchart TB
    User(["👤 User<br/>Browser / Mobile"]):::user

    subgraph EDGE["🛡️ Edge Layer - middleware.js"]
        direction LR
        Arcjet["Arcjet<br/>Shield + Bot Detection"]:::security
        Clerk["Clerk<br/>Auth + Route Protection"]:::security
        Arcjet --> Clerk
    end

    subgraph APP["⚡ Next.js 15 App - Vercel"]
        direction TB
        UI["App Router Pages<br/>Dashboard, Account, Transaction"]:::frontend
        SA["Server Actions<br/>account, budget, dashboard, transaction"]:::backend
        LC["LangChain Service<br/>app/lib/langchain.js"]:::ai
        UI --> SA
        SA --> LC
    end

    subgraph JOBS["⏱️ Background Jobs"]
        Inngest["Inngest<br/>/api/inngest"]:::jobs
    end

    subgraph DATA["🗄️ Data Layer"]
        Prisma["Prisma ORM"]:::data
        PG[("PostgreSQL<br/>Supabase / Neon")]:::data
        Prisma --> PG
    end

    subgraph EXT["☁️ External Services"]
        Gemini["Google Gemini 2.5 Flash"]:::ai
        Resend["Resend Email API"]:::email
    end

    User --> Arcjet
    Clerk --> UI
    SA --> Prisma
    SA -->|"receipt scan"| Gemini
    LC -->|"financial advice"| Gemini
    Inngest --> Prisma
    Inngest -->|"monthly reports"| Gemini
    Inngest --> Resend
    Inngest -.->|"triggers"| SA

    classDef user fill:#fde68a,stroke:#b45309,stroke-width:2px,color:#451a03
    classDef security fill:#fecaca,stroke:#b91c1c,stroke-width:2px,color:#450a0a
    classDef frontend fill:#bfdbfe,stroke:#1d4ed8,stroke-width:2px,color:#172554
    classDef backend fill:#c7d2fe,stroke:#4338ca,stroke-width:2px,color:#1e1b4b
    classDef ai fill:#e9d5ff,stroke:#7e22ce,stroke-width:2px,color:#3b0764
    classDef jobs fill:#fed7aa,stroke:#c2410c,stroke-width:2px,color:#431407
    classDef data fill:#bbf7d0,stroke:#15803d,stroke-width:2px,color:#052e16
    classDef email fill:#fbcfe8,stroke:#be185d,stroke-width:2px,color:#500724
```

### 2. Request Security Flow

Every request passes through Arcjet first, then Clerk. Account and transaction creation add a per-user rate limit.

```mermaid
flowchart LR
    Req(["Incoming Request"]):::start --> Shield{"Arcjet Shield<br/>attack detected?"}:::check
    Shield -->|"yes"| Block1["403 Blocked"]:::deny
    Shield -->|"no"| Bot{"Bot Detection<br/>allowed bot?"}:::check
    Bot -->|"no"| Block2["403 Blocked"]:::deny
    Bot -->|"yes / human"| Route{"Protected route?<br/>dashboard, account, transaction"}:::check
    Route -->|"no"| Public["Serve public page"]:::ok
    Route -->|"yes"| Auth{"Clerk<br/>signed in?"}:::check
    Auth -->|"no"| Redirect["Redirect to /sign-in"]:::warn
    Auth -->|"yes"| Rate{"Token Bucket<br/>10 per hour per user"}:::check
    Rate -->|"limit hit"| Block3["Request rejected"]:::deny
    Rate -->|"ok"| Done["Run Server Action"]:::ok

    classDef start fill:#fde68a,stroke:#b45309,stroke-width:2px,color:#451a03
    classDef check fill:#bfdbfe,stroke:#1d4ed8,stroke-width:2px,color:#172554
    classDef deny fill:#fecaca,stroke:#b91c1c,stroke-width:2px,color:#450a0a
    classDef warn fill:#fed7aa,stroke:#c2410c,stroke-width:2px,color:#431407
    classDef ok fill:#bbf7d0,stroke:#15803d,stroke-width:2px,color:#052e16
```

### 3. AI Receipt Scanner Flow

```mermaid
sequenceDiagram
    autonumber
    actor U as 👤 User
    participant F as Transaction Form
    participant S as scanReceipt Server Action
    participant G as Gemini 2.5 Flash
    participant D as PostgreSQL

    rect rgb(219, 234, 254)
    Note over U,F: Upload
    U->>F: Upload receipt image
    F->>S: Send file as base64
    end

    rect rgb(243, 232, 255)
    Note over S,G: AI extraction
    S->>G: Prompt + image
    G-->>S: JSON with amount, date, description, merchant, category
    S->>S: Clean and parse JSON
    end

    rect rgb(220, 252, 231)
    Note over F,D: Save
    S-->>F: Pre-filled form data
    U->>F: Review and submit
    F->>S: createTransaction
    S->>D: Insert transaction and update balance
    D-->>U: Dashboard refreshed
    end
```

### 4. AI Insights Flow with Fallback

```mermaid
flowchart LR
    A(["Dashboard<br/>Generate Insights"]):::start --> B["generateInsights<br/>Server Action"]:::backend
    B --> C["getDashboardData<br/>recent transactions"]:::data
    C --> D["getFinancialAdvice<br/>LangChain chain"]:::ai
    D --> E["PromptTemplate<br/>Financial Advisor role"]:::ai
    E --> F["Gemini 2.5 Flash"]:::ai
    F --> G["StringOutputParser"]:::ai
    G --> H{"AI call<br/>succeeded?"}:::check
    H -->|"yes"| I["3 data-driven<br/>recommendations"]:::ok
    H -->|"no"| J["Fallback template<br/>rule-based summary"]:::warn
    I --> K(["Shown on Dashboard"]):::start
    J --> K

    classDef start fill:#fde68a,stroke:#b45309,stroke-width:2px,color:#451a03
    classDef backend fill:#c7d2fe,stroke:#4338ca,stroke-width:2px,color:#1e1b4b
    classDef data fill:#bbf7d0,stroke:#15803d,stroke-width:2px,color:#052e16
    classDef ai fill:#e9d5ff,stroke:#7e22ce,stroke-width:2px,color:#3b0764
    classDef check fill:#bfdbfe,stroke:#1d4ed8,stroke-width:2px,color:#172554
    classDef ok fill:#bbf7d0,stroke:#15803d,stroke-width:2px,color:#052e16
    classDef warn fill:#fed7aa,stroke:#c2410c,stroke-width:2px,color:#431407
```

### 5. Background Jobs (Inngest)

```mermaid
flowchart TB
    subgraph CRON["⏰ Scheduled Triggers"]
        C1["Daily at 00:00<br/>trigger-recurring-transactions"]:::cron
        C2["Every 6 hours<br/>check-budget-alerts"]:::cron
        C3["1st of every month<br/>generate-monthly-reports"]:::cron
    end

    C1 -->|"finds due recurring items"| E1["Event: transaction.recurring.process"]:::event
    E1 --> J1["process-recurring-transaction<br/>create transaction, update balance,<br/>set next date"]:::job
    J1 --> DB[("PostgreSQL")]:::data

    C2 --> J2["Compare monthly spending<br/>with budget"]:::job
    J2 --> Q{"Spent 80% or more<br/>and no alert this month?"}:::check
    Q -->|"yes"| M1["Send budget alert email"]:::email
    Q -->|"no"| Skip["Do nothing"]:::muted
    M1 --> DB

    C3 --> J3["Collect last month stats<br/>per user"]:::job
    J3 --> AI["Gemini writes<br/>financial insights"]:::ai
    AI --> M2["Send monthly report email"]:::email

    M1 --> R["Resend"]:::email
    M2 --> R

    classDef cron fill:#fed7aa,stroke:#c2410c,stroke-width:2px,color:#431407
    classDef event fill:#fde68a,stroke:#b45309,stroke-width:2px,color:#451a03
    classDef job fill:#c7d2fe,stroke:#4338ca,stroke-width:2px,color:#1e1b4b
    classDef data fill:#bbf7d0,stroke:#15803d,stroke-width:2px,color:#052e16
    classDef check fill:#bfdbfe,stroke:#1d4ed8,stroke-width:2px,color:#172554
    classDef email fill:#fbcfe8,stroke:#be185d,stroke-width:2px,color:#500724
    classDef ai fill:#e9d5ff,stroke:#7e22ce,stroke-width:2px,color:#3b0764
    classDef muted fill:#e5e7eb,stroke:#6b7280,stroke-width:2px,color:#1f2937
```

### 6. Database Schema

```mermaid
erDiagram
    USER ||--o{ ACCOUNT : owns
    USER ||--o{ TRANSACTION : makes
    USER ||--o| BUDGET : sets
    ACCOUNT ||--o{ TRANSACTION : contains

    USER {
        string id PK
        string clerkUserId UK
        string email UK
        string name
        string imageUrl
    }
    ACCOUNT {
        string id PK
        string name
        enum type "CURRENT or SAVINGS"
        decimal balance
        boolean isDefault
        string userId FK
    }
    TRANSACTION {
        string id PK
        enum type "INCOME or EXPENSE"
        decimal amount
        string category
        datetime date
        boolean isRecurring
        enum recurringInterval "DAILY to YEARLY"
        enum status "PENDING, COMPLETED, FAILED"
        string accountId FK
        string userId FK
    }
    BUDGET {
        string id PK
        decimal amount
        datetime lastAlertSent
        string userId FK
    }
```

### 7. Deployment Pipeline

```mermaid
flowchart LR
    Dev["💻 Developer<br/>git push"]:::dev --> GH["GitHub<br/>main branch"]:::git
    GH --> V["▲ Vercel<br/>npm install, prisma generate,<br/>next build"]:::deploy
    V --> Live(["🌐 Live App<br/>*.vercel.app"]):::live
    Live --> Clerk["Clerk<br/>Auth"]:::svc
    Live --> DB[("Supabase / Neon<br/>PostgreSQL")]:::data
    Live --> Gem["Gemini API"]:::ai
    Live --> Ing["Inngest Cloud<br/>cron jobs"]:::jobs
    Ing -->|"calls /api/inngest"| Live

    classDef dev fill:#fde68a,stroke:#b45309,stroke-width:2px,color:#451a03
    classDef git fill:#e5e7eb,stroke:#374151,stroke-width:2px,color:#111827
    classDef deploy fill:#bfdbfe,stroke:#1d4ed8,stroke-width:2px,color:#172554
    classDef live fill:#bbf7d0,stroke:#15803d,stroke-width:3px,color:#052e16
    classDef svc fill:#fecaca,stroke:#b91c1c,stroke-width:2px,color:#450a0a
    classDef data fill:#bbf7d0,stroke:#15803d,stroke-width:2px,color:#052e16
    classDef ai fill:#e9d5ff,stroke:#7e22ce,stroke-width:2px,color:#3b0764
    classDef jobs fill:#fed7aa,stroke:#c2410c,stroke-width:2px,color:#431407
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sourabhvamdevan/ai-finance-platform.git
cd ai-finance-platform
```

### 2. Install Dependencies

```bash
npm install
```

The project includes an `.npmrc` with `legacy-peer-deps=true` to resolve a peer dependency conflict between `react-day-picker` and `date-fns`.

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database (use the pooled URL for DATABASE_URL, the direct URL for DIRECT_URL)
DATABASE_URL=
DIRECT_URL=

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI and third-party APIs
GEMINI_API_KEY=
RESEND_API_KEY=
ARCJET_KEY=

# Background jobs (required in production for Inngest)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

### 4. Database Initialization

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run background jobs locally, start the Inngest dev server in a second terminal:

```bash
npx inngest-cli@latest dev
```

---

## Deploying to Vercel

1. Push the repository to GitHub.
2. Create the database tables once from your machine: `npx prisma db push`.
3. In Vercel, choose **Add New, then Project**, and import the repository. The Next.js preset is detected automatically.
4. Add every variable from the environment section above under **Project Settings, then Environment Variables**, and deploy.
5. In the Clerk dashboard, add your `*.vercel.app` domain.
6. Install the Inngest integration from the Vercel Marketplace (or set the two Inngest keys), then sync `https://your-app.vercel.app/api/inngest`.

Notes:

* `ARCJET_KEY` is required. Without it, requests will fail in the middleware.
* The `/api/seed` route is disabled in production.
* Receipt uploads are limited to 4 MB to stay under Vercel's request body limit.

---

## Docker Deployment (Optional)

To run the app in a container, set `output: "standalone"` in `next.config.mjs`, then:

```bash
docker build -t ai-sentinel-finance .
docker run -p 3000:3000 --env-file .env ai-sentinel-finance
```

---

## Detailed Implementation: LangChain Service

The AI features are handled by a dedicated service layer built with LangChain, located at `app/lib/langchain.js`. This keeps prompt engineering and model chaining separate from the UI.

For a full breakdown of the setup, see [langchain_setup.md](./langchain_setup.md). It covers:

* Configuring the `ChatGoogleGenerativeAI` model.
* Defining prompt templates for financial reasoning.
* Implementing the `getFinancialAdvice` function with fallback logic.
* Integrating AI insights into the dashboard through Server Actions.

---

## Implementation Highlights

* **Server Actions**: Secure backend operations without separate API boilerplate.
* **AI Service Layer**: Reusable LangChain integration for structured financial reasoning.
* **Graceful Degradation**: A fallback summary is shown if the AI API is unavailable.
* **Responsive Dashboard**: A mobile-first UI for managing finances on the go.
* **Transactional Integrity**: Prisma transactions keep balances accurate during bulk deletes and updates.
* **Security by Default**: Arcjet shield and bot detection on all routes, plus per-user rate limiting on account creation.
* **Containerization**: Multi-stage Docker build on Alpine Linux with Next.js standalone output.

---

## Project Structure

```
actions/        Server actions (accounts, budgets, transactions, dashboard)
app/            Next.js routes, layouts and the LangChain service (app/lib)
components/     UI components (Shadcn)
lib/            Prisma, Arcjet, Inngest and helper utilities
prisma/         Database schema and migrations
emails/         React Email templates
```

---

## Author

**Sourabh** ([@sourabhvamdevan](https://github.com/sourabhvamdevan))
