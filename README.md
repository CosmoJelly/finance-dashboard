# ₿-Ledger
### A personal finance dashboard that actually looks good

I got tired of spreadsheets. So I built this — a dark, minimal finance dashboard that connects to your real bank accounts via Plaid and gives you a proper breakdown of where your money is going.

Built with Next.js, PostgreSQL, too much coffee, and a mind that it withering away in unemployment.

---
![CodeQL](https://github.com/CosmoJelly/finance-dashboard/actions/workflows/codeql.yml/badge.svg)


## What it does

- **Connects to your bank** via Plaid Link — works with most major institutions
- **Categorizes transactions** automatically across 10+ spending categories
- **Spending breakdown** — donut chart so you can see exactly where the money is leaking
- **Monthly trends** — 6 months of spending history in a bar chart
- **Top merchants** — ranked by how much you've given them your money
- **Transaction search** — filter by category, date range (7/30/90 days), or keyword
- **Account balances** — all your accounts in one place, real-time

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Banking | Plaid API |
| Database | PostgreSQL |

---

## Getting it running

### Prerequisites
- Node.js 18+
- PostgreSQL
- A free Plaid dev account

### 1. Clone and install

```bash
git clone https://github.com/CosmoJelly/finance-dashboard.git
cd finance-dashboard
npm install
```

### 2. Environment variables

Fill in `.env.local` with your keys:

```env
# Plaid
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_sandbox_secret
PLAID_ENV=sandbox

# PostgreSQL
DATABASE_URL=postgresql://yourusername@localhost:5432/finance_dashboard
```

### 3. Set up the database

```bash
createdb finance_dashboard
npm run db:migrate
```

### 4. Run it

```bash
npm run dev
```

Open http://localhost:3000 and you're in.

---

## Plaid Sandbox

When the Plaid modal pops up, pick any bank and use these credentials:

```
Username: user_good
Password: pass_good
```

It'll populate around 90 days of realistic (fake) transaction data instantly.

---

## Project structure

```
finance-dashboard/
├── app/
│   ├── api/
│   │   ├── create-link-token/
│   │   ├── exchange-token/
│   │   ├── transactions/
│   │   └── accounts/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── PlaidConnect.tsx
│   ├── SpendingChart.tsx
│   ├── MonthlyChart.tsx
│   ├── TransactionList.tsx
│   ├── AccountCards.tsx
│   └── StatCard.tsx
├── lib/
│   ├── db.ts
│   └── plaid.ts
├── types/index.ts
└── scripts/migrate.js
```

---

## Database schema

Three tables, pretty straightforward:

```sql
plaid_items  (id, user_id, item_id, access_token, institution_name)
accounts     (id, item_id → plaid_items, account_id, name, type, current_balance)
transactions (id, account_id → accounts, transaction_id, amount, date,
              name, merchant_name, category[], primary_category, pending)
```

---

## 🎧 Built to these playlists

> *[smell the roses](https://open.spotify.com/playlist/6OLn8jEniAqL4jynGHKl7C?si=f9d3dd452bda40b8)*

> *[love letter](https://open.spotify.com/playlist/7jof5LpBGXYGwtb3AWVDjA?si=3224de11d9614030)*

> *[top lane tunes](https://open.spotify.com/playlist/2NDdO4ZAQTUg8ae5LY8t5y?si=cde32e103ce644a6)*
---

## License

Do whatever you want with it. This was just to see if I could do it or not.
