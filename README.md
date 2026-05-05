# Ledger — Personal Finance Dashboard

A dark, editorial-style personal finance dashboard built with **Next.js 14**, **Plaid Sandbox**, and **PostgreSQL**.

## Features

- 🔗 **Plaid Link** — Connect any bank account via Plaid's sandbox
- 📊 **Spending Breakdown** — Donut chart categorizing all expenses
- 📅 **Monthly Trends** — Bar chart of 6-month spending history
- 🏦 **Account Management** — Real-time balance across all linked accounts
- 🔍 **Transaction Search** — Filter by category, date range, or keyword
- 🏪 **Top Merchants** — Ranked bar chart of highest spend
- ⚡ **7/30/90-day filters** — Adjustable date range throughout

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Charts | Recharts |
| Banking | Plaid API (Sandbox) |
| Database | PostgreSQL |
| Fonts | DM Serif Display + DM Mono |

---

## Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL running locally
- Plaid developer account

### 2. Clone & Install

```bash
git clone <your-repo>
cd finance-dashboard
npm install
```

### 3. Environment Variables

Create `.env.local` and fill in your values:

```env
# Plaid
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_sandbox_secret
PLAID_ENV=sandbox

# PostgreSQL
DATABASE_URL=postgresql://yourusername@localhost:5432/finance_dashboard

# Next.js
NEXTAUTH_SECRET=any_random_secret_id
NEXTAUTH_URL=http://localhost:3000
```

### 4. Create Database

```bash
createdb finance_dashboard
```

### 5. Run Migrations

```bash
npm run db:migrate
```

This creates:
- `plaid_items` — stores access tokens per linked institution
- `accounts` — bank/credit account details + balances
- `transactions` — all synced transactions with categories

### 6. Start Dev Server

```bash
npm run dev
```

Open http://localhost:3000

---

## Plaid Sandbox Credentials

When the Plaid Link modal opens, use any institution and:

| Field | Value |
|-------|-------|
| Username | `user_good` |
| Password | `pass_good` |

This will populate ~90 days of realistic mock transactions.

When prompted with a phone number just ignore it and keep going.

---

## Project Structure

```
finance-dashboard/
├── app/
│   ├── api/
│   │   ├── create-link-token/route.ts   # POST: create Plaid Link token
│   │   ├── exchange-token/route.ts      # POST: swap public token, sync accounts+txns
│   │   ├── transactions/route.ts        # GET:  fetch txns, categories, monthly data
│   │   └── accounts/route.ts            # GET:  fetch linked accounts
│   ├── dashboard/
│   │   └── page.tsx                     # Main dashboard UI (client)
│   ├── layout.tsx
│   ├── page.tsx                         # Redirects to /dashboard
│   └── globals.css
├── components/
│   ├── PlaidConnect.tsx                 # Plaid Link button
│   ├── SpendingChart.tsx                # Donut chart (Recharts)
│   ├── MonthlyChart.tsx                 # Bar chart (Recharts)
│   ├── TransactionList.tsx              # Searchable transaction list
│   ├── AccountCards.tsx                 # Account balance cards
│   └── StatCard.tsx                     # KPI metric cards
├── lib/
│   ├── db.ts                            # PostgreSQL pool + query helper
│   └── plaid.ts                         # Plaid client + category config
├── types/
│   └── index.ts                         # Shared TypeScript types
└── scripts/
    └── migrate.js                       # DB migration runner
```

## Database Schema

```sql
plaid_items (id, user_id, item_id, access_token, institution_name)
accounts    (id, item_id→plaid_items, account_id, name, type, current_balance, ...)
transactions(id, account_id→accounts, transaction_id, amount, date, name, 
             merchant_name, category[], primary_category, pending)
```
