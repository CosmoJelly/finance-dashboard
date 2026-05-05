import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments ?? 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)

// Category color mappings
export const CATEGORY_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  'Food and Drink': { color: '#E07A5F', icon: '🍽️', label: 'Food & Drink' },
  'Shopping': { color: '#C9A84C', icon: '🛍️', label: 'Shopping' },
  'Travel': { color: '#52B788', icon: '✈️', label: 'Travel' },
  'Transportation': { color: '#3D405B', icon: '🚗', label: 'Transport' },
  'Entertainment': { color: '#9B5DE5', icon: '🎬', label: 'Entertainment' },
  'Healthcare': { color: '#00BBF9', icon: '🏥', label: 'Healthcare' },
  'Personal Finance': { color: '#F15BB5', icon: '💳', label: 'Finance' },
  'Home': { color: '#FEE440', icon: '🏠', label: 'Home' },
  'Income': { color: '#2D6A4F', icon: '💰', label: 'Income' },
  'Transfer': { color: '#6B7280', icon: '↔️', label: 'Transfer' },
  'Other': { color: '#9CA3AF', icon: '📦', label: 'Other' },
}

export function getCategoryConfig(categories: string[] | null) {
  if (!categories || categories.length === 0) return CATEGORY_CONFIG['Other']
  const primary = categories[0]
  return CATEGORY_CONFIG[primary] ?? CATEGORY_CONFIG['Other']
}
