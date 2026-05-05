'use client'

interface Account {
  id: number
  name: string
  official_name: string | null
  type: string
  subtype: string | null
  current_balance: number | null
  available_balance: number | null
  institution_name: string
}

interface AccountCardsProps {
  accounts: Account[]
}

const ACCOUNT_ICONS: Record<string, string> = {
  depository: '🏦',
  credit: '💳',
  investment: '📈',
  loan: '🏠',
  other: '💰',
}

export function AccountCards({ accounts }: AccountCardsProps) {
  if (!accounts.length) {
    return (
      <p className="text-xs opacity-40 py-4 text-center">
        No accounts connected yet
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {accounts.map((acct) => {
        const icon = ACCOUNT_ICONS[acct.type] ?? ACCOUNT_ICONS.other
        const balance = acct.current_balance ?? 0
        const isCredit = acct.type === 'credit'

        return (
          <div
            key={acct.id}
            className="flex items-center gap-3 px-3 py-3 rounded-sm transition-colors
                       hover:bg-white/3 border border-transparent hover:border-gold/10"
          >
            <div className="text-lg">{icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-cream truncate">{acct.name}</p>
              <p className="text-xs opacity-40">{acct.institution_name}</p>
            </div>
            <div className="text-right">
              <p
                className={`text-xs font-medium ${
                  isCredit && balance > 0 ? 'text-coral' : 'text-jade-light'
                }`}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                ${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              {acct.available_balance != null && (
                <p className="text-xs opacity-30">
                  ${acct.available_balance.toLocaleString('en-US', { minimumFractionDigits: 0 })} avail
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
