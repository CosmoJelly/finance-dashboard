export interface PlaidItem {
  id: number
  user_id: string
  item_id: string
  access_token: string
  institution_name: string
  created_at: string
}

export interface Account {
  id: number
  item_id: number
  account_id: string
  name: string
  official_name: string | null
  type: string
  subtype: string | null
  current_balance: number | null
  available_balance: number | null
  currency_code: string
}

export interface Transaction {
  id: number
  account_id: number
  transaction_id: string
  amount: number
  date: string
  name: string
  merchant_name: string | null
  category: string[]
  primary_category: string
  pending: boolean
  currency_code: string
}

export interface SpendingByCategory {
  category: string
  total: number
  count: number
  color: string
  icon: string
}

export interface MonthlySpending {
  month: string
  total: number
}

export interface DashboardData {
  accounts: Account[]
  transactions: Transaction[]
  spendingByCategory: SpendingByCategory[]
  monthlySpending: MonthlySpending[]
  totalBalance: number
  monthlySpend: number
  topMerchants: { name: string; total: number; count: number }[]
}
