'use client'

import { useState } from 'react'
import { CATEGORY_CONFIG } from '@/lib/plaid'
import { format, parseISO } from 'date-fns'

interface Transaction {
  transaction_id: string
  name: string
  merchant_name: string | null
  amount: number
  date: string
  primary_category: string
  account_name: string
  pending: boolean
}

interface TransactionListProps {
  transactions: Transaction[]
  onCategoryFilter: (cat: string | null) => void
  activeCategory: string | null
}

export function TransactionList({
  transactions,
  onCategoryFilter,
  activeCategory,
}: TransactionListProps) {
  const [search, setSearch] = useState('')

  const filtered = transactions.filter((tx) => {
    const q = search.toLowerCase()
    return (
      tx.name.toLowerCase().includes(q) ||
      (tx.merchant_name?.toLowerCase().includes(q) ?? false)
    )
  })

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-xs">⌕</span>
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border border-ink-soft rounded-sm pl-8 pr-4 py-2 text-xs
                     text-cream placeholder-cream/30 focus:outline-none focus:border-gold/50
                     transition-colors"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      </div>

      {/* Filter chips */}
      {activeCategory && (
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-40">Filtered:</span>
          <button
            onClick={() => onCategoryFilter(null)}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-gold/10 border border-gold/30
                       text-gold rounded-sm hover:bg-gold/20 transition-colors"
          >
            {activeCategory}
            <span className="ml-1 opacity-60">✕</span>
          </button>
        </div>
      )}

      {/* Transaction rows */}
      <div className="flex flex-col divide-y divide-ink-soft/50">
        {filtered.length === 0 ? (
          <p className="text-xs opacity-40 py-8 text-center">No transactions found</p>
        ) : (
          filtered.map((tx) => {
            const cfg = CATEGORY_CONFIG[tx.primary_category] ?? CATEGORY_CONFIG['Other']
            const isExpense = tx.amount > 0
            const displayDate = format(parseISO(tx.date), 'MMM d')

            return (
              <div
                key={tx.transaction_id}
                className="flex items-center gap-3 py-3 group hover:bg-white/2 transition-colors"
              >
                {/* Category icon */}
                <div
                  className="w-8 h-8 rounded-sm flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: cfg.color + '22', border: `1px solid ${cfg.color}44` }}
                >
                  {cfg.icon}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-cream truncate">
                    {tx.merchant_name ?? tx.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <button
                      onClick={() => onCategoryFilter(tx.primary_category)}
                      className="text-xs opacity-40 hover:opacity-70 transition-opacity hover-underline"
                    >
                      {cfg.label}
                    </button>
                    <span className="text-xs opacity-20">·</span>
                    <span className="text-xs opacity-30">{tx.account_name}</span>
                  </div>
                </div>

                {/* Date + Amount */}
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-xs font-medium ${isExpense ? 'text-coral' : 'amount-positive'}`}
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {isExpense ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <p className="text-xs opacity-30">{displayDate}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
