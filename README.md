# AgeWell RI - Frontend Web Application

The official client and administrator web portal for **AgeWell RI** — providing elderly care management, family coordination, appointment booking, visit documentation, and subscription management.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **UI Library:** React 19
- **State Management:** Redux Toolkit & RTK Query (automatic caching & cache invalidation)
- **Styling:** Tailwind CSS v4 (with `@tailwindcss/postcss`)
- **Icons & UI:** Lucide React, SweetAlert2
- **Document & PDF Generation:** jsPDF, html2canvas
- **Payments:** Stripe Elements (`@stripe/stripe-js`, `@stripe/react-stripe-js`)
- **Package Manager:** `pnpm` (v11+)

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your machine:

1. **Node.js** (v20.0.0 or higher) - [Download](https://nodejs.org/)
2. **pnpm** (v9.0.0 or higher) - Install via `npm install -g pnpm`
3. Running instance of the **AgeWell RI Backend API** (running at `http://localhost:5173` by default).

---

## 🚀 Setup & Installation

### 1. Clone & Navigate to Repository

```bash
git clone <repository-url>
cd age-well-ri
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create your local `.env.local` file by copying `.env.example`:

```bash
cp .env.example .env.local
```

Open `.env.local` and ensure the API base URL matches your running backend:

```env
NEXT_PUBLIC_API_URL="http://localhost:5173/api/v1"
NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"
```

---

## 💻 Running the Application

### Development Mode

Start the Next.js development server with Turbopack:

```bash
pnpm dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### Production Build

Create an optimized production bundle and start the production server:

```bash
pnpm build
pnpm start
```

### Type Checking & Linting

```bash
# Validate TypeScript typings
npx tsc --noEmit

# Run ESLint
pnpm lint
```

---

## 🧭 Key Portals & Features

### 1. Member & Family Portal (`/dashboard`)
- **Client Overview:** Next scheduled visit, plan entitlements, caregiver notes, and recent safety reports.
- **Appointment Scheduling:** Book safety and cleaning visits with assigned specialists.
- **Family Circle:** Invite family members with tailored notification and report-viewing permissions.
- **Service Agreements:** View and download signed electronic care service agreements.
- **Invoices & Billing:** View past billing statements, update payment methods, and manage subscription renewals.

### 2. 9-Step Onboarding Wizard (`/register`)
- Account creation & email verification.
- Care plan selection (pricing tiers).
- Resident & emergency contact details.
- Home access methods (lockbox, hidden key, neighbor, etc.).
- Electronic agreement signing with e-signature capture.
- Secure Stripe Elements card setup.

### 3. Administrator Operations Portal (`/admin`)
- **Operational Dashboard:** Live KPIs, active member counts, safety visit backlogs, and revenue statistics.
- **Schedule & Specialists:** Manage technician shifts, assign visits, and monitor field schedules.
- **Client Management:** Member directory, assessment reviews, and care notes.
- **Billing & Stripe Gateway Settings:** Securely view, test, and update Stripe Publishable, Secret, and Webhook keys stored encrypted in the database.

---

## 📂 Project Structure

```
age-well-ri/
├── app/                     # Next.js App Router (pages and layouts)
│   ├── (auth)/              # Authentication routes (login, register, forgot-password)
│   ├── admin/               # Administrative operations routes
│   ├── dashboard/           # Client & family portal routes
│   ├── layout.tsx           # Global root layout & font definitions
│   └── globals.css          # Global Tailwind CSS styles
├── components/
│   ├── admin/               # Admin modals, tables, and KPI cards
│   ├── auth/                # Login, register, and password forms
│   ├── dashboard/           # Client dashboard cards, calendars, and tables
│   ├── signup/              # 9-step registration wizard components
│   └── ui/                  # Reusable UI primitives
├── lib/
│   ├── alerts/              # SweetAlert2 notification helpers
│   ├── api/                 # Specialized API and report download helpers
│   ├── auth/                # JWT cookie token management
│   └── utils/               # PDF generation and formatters
├── redux/
│   ├── api/baseApi.ts       # Central RTK Query base API
│   ├── features/            # Feature-specific API endpoints and slices
│   └── store.ts             # Redux store configuration
├── .env.example             # Documented frontend environment template
├── pnpm-workspace.yaml      # Dependency security overrides
└── tsconfig.json            # TypeScript configuration
```

---

## 🔒 Security & Quality Assurance

- **Zero Security Vulnerabilities:** All dependencies are verified using `pnpm audit`.
- **Environment Isolation:** Secrets are never hardcoded in source files. Backend endpoints and keys are loaded exclusively through environment variables.
