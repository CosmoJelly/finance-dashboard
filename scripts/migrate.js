// scripts/migrate.js
// Run with: node scripts/migrate.js

require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const migrations = `
-- Plaid items (linked bank accounts)
CREATE TABLE IF NOT EXISTS plaid_items (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL DEFAULT 'default_user',
  item_id VARCHAR(255) UNIQUE NOT NULL,
  access_token VARCHAR(500) NOT NULL,
  institution_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank accounts
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES plaid_items(id) ON DELETE CASCADE,
  account_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  official_name VARCHAR(255),
  type VARCHAR(100),
  subtype VARCHAR(100),
  current_balance DECIMAL(12,2),
  available_balance DECIMAL(12,2),
  currency_code VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  name VARCHAR(500),
  merchant_name VARCHAR(500),
  category TEXT[],
  primary_category VARCHAR(255),
  pending BOOLEAN DEFAULT FALSE,
  currency_code VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(primary_category);
CREATE INDEX IF NOT EXISTS idx_accounts_item ON accounts(item_id);
`

async function migrate() {
  console.log('🗄️  Running database migrations...')
  try {
    await pool.query(migrations)
    console.log('✅ Migrations complete!')
  } catch (err) {
    console.error('❌ Migration failed:', err)
  } finally {
    await pool.end()
  }
}

migrate()
