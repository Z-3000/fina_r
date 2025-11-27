# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FINA_R is a Korean smart tax and financial management platform built with React + Vite. It provides receipt management via OCR, budget tracking, tax calculation based on Korean tax law, and gamification features.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (Vite only)
npm run dev

# Development with mock API (JSON Server on port 3001)
npm run dev:full

# Production build
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=<supabase_url>
VITE_SUPABASE_ANON_KEY=<supabase_anon_key>
```

## Architecture

### Frontend Stack
- **React 18** with Vite 5
- **Tailwind CSS** for styling (flat design system)
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Supabase** (PostgreSQL + Auth + Edge Functions)
- Row Level Security (RLS) enabled on all tables

### Key Source Directories

```
src/
├── App.jsx                    # Main app (very large ~300KB, contains most UI logic)
├── components/views/          # View components extracted from App.jsx
│   ├── DashboardView.jsx
│   ├── ReceiptsView.jsx
│   ├── BudgetView.jsx
│   ├── TaxPredictionView.jsx
│   ├── BenefitsView.jsx
│   └── ChallengesView.jsx
├── services/
│   ├── supabaseApi.js         # All Supabase API modules (authAPI, receiptsAPI, etc.)
│   ├── taxCalculator.js       # Korean tax calculation logic (2025 tax law)
│   ├── ocrService.js          # Tesseract.js OCR processing
│   ├── exportService.jsx      # PDF/Excel export (jsPDF, xlsx)
│   └── ocr/                   # Modular OCR parsing system
├── constants/
│   ├── colors.js              # Design system colors (single source of truth)
│   └── businessTaxConstants.js # Business tax constants
├── context/
│   ├── AuthContext.jsx
│   └── ToastContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useChallengesData.js
└── lib/
    └── supabase.js            # Supabase client initialization
```

### Design System

Color system defined in `src/constants/colors.js` and mirrored in `tailwind.config.js`:
- **Primary (Navy)**: `#003262` - main brand, professional, trust
- **Secondary (Mint)**: `#00FFBF` - success, growth, income
- **Tertiary (Cyan)**: `#0FFFFF` - highlights, information
- **Accent (Peach)**: `#FFC591` - warm accent, rewards, warnings

Use the exported `COLORS` object or Tailwind classes (`text-primary`, `bg-secondary`, etc.).

### Tax Calculator (`src/services/taxCalculator.js`)

Implements 2025 Korean tax law for:
- **Individuals**: Income tax brackets, earned income deduction, personal deductions, special deductions (insurance, medical, education, housing), credit card deduction (3-tier limit system)
- **Business**: Comprehensive income tax, VAT (general/simplified taxpayer), quarterly estimates

Key exports:
- `calculateIndividualTax(data)` - Full individual tax calculation
- `calculateBusinessTax(data)` - Business tax calculation
- `calculateDetailedTaxHealthScores(data)` - Tax health scoring
- `calculateCreditCardDeduction(totalSalary, cardUsage)` - Card spending deduction

### API Service (`src/services/supabaseApi.js`)

Exports multiple API modules: `authAPI`, `receiptsAPI`, `budgetsAPI`, `accountsAPI`, `challengesAPI`, `deductionAPI`, `insightsAPI`, `notificationsAPI`, `attendanceAPI`, `rewardsAPI`, `taxAPI`, `missionsAPI`, `eventsAPI`, `communityAPI`, `leaderboardAPI`, `gamificationAPI`, etc.

### Database (Supabase)

Key tables: `profiles`, `receipts`, `budgets`, `linked_accounts`, `challenges`, `user_challenges`, `deduction_tracker`, `individual_tax_data`, `business_tax_data`, `attendance`, `rewards`, `missions`

All user tables reference `profiles.id` which links to `auth.users`.

Migrations in `supabase/migrations/` numbered sequentially (001, 002, etc.).

## Code Conventions

- Korean language used in UI text and comments
- Numbers formatted with Korean won (원) and thousands separator
- Date handling via `date-fns`
- Toast notifications via `react-hot-toast` and custom `ToastContext`
- File contains both JSX components and business logic (monolithic App.jsx being gradually refactored)

## Deployment

- **Platform**: Vercel
- **Config**: `vercel.json` with static build
- **Output**: `dist/`
