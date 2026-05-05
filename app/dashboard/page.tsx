'use client'

import { useCallback, useEffect, useState } from 'react'
import { PlaidConnect } from '@/components/PlaidConnect'
import { SpendingChart } from '@/components/SpendingChart'
import { MonthlyChart } from '@/components/MonthlyChart'
import { TransactionList } from '@/components/TransactionList'
import { AccountCards } from '@/components/AccountCards'
import { StatCard } from '@/components/StatCard'

interface DashboardData {
  accounts: any[]
  transactions: any[]
  spendingByCategory: any[]
  monthlySpending: any[]
  totalBalance: number
  monthlySpend: number
  topMerchants: { name: string; total: number; count: number }[]
}

type Tab = 'overview' | 'transactions' | 'accounts'
type DateRange = '7' | '30' | '90'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccounts, setHasAccounts] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [dateRange, setDateRange] = useState<DateRange>('30')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ days: dateRange, limit: '200' })
      if (categoryFilter) params.set('category', categoryFilter)
      const res = await fetch(`/api/transactions?${params}`)
      const json = await res.json()
      if (json.accounts?.length > 0) {
        setHasAccounts(true)
        setData(json)
      } else {
        setHasAccounts(false)
      }
    } catch (e) {
      console.error('Failed to fetch data', e)
    } finally {
      setLoading(false)
    }
  }, [dateRange, categoryFilter, refreshKey])

  useEffect(() => { fetchData() }, [fetchData])

  const onPlaidSuccess = () => { setRefreshKey(k => k + 1) }

  const totalBalanceFormatted = data
    ? `$${Math.abs(data.totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : '$0.00'

  const monthlySpendFormatted = data
    ? `$${data.monthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : '$0.00'

  const txCount = data?.transactions?.filter((t: any) => t.amount > 0).length ?? 0

  return (
    <div className="grain min-h-screen" style={{ background: 'var(--ink)' }}>
      {/* Header */}
      <header className="border-b border-ink-soft/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-sm flex items-center justify-center text-sm"
              style={{ background: 'var(--gold)', color: 'var(--ink)' }}
            >
              ₿
            </div>
            <span
              className="text-lg text-gold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Ledger
            </span>
            <span className="text-xs opacity-30 hidden sm:block ml-1">
              / personal finance
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Date range selector */}
            <div className="flex items-center gap-1 border border-ink-soft rounded-sm overflow-hidden">
              {(['7', '30', '90'] as DateRange[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDateRange(d)}
                  className={`px-3 py-1.5 text-xs transition-colors ${
                    dateRange === d
                      ? 'bg-gold text-ink font-medium'
                      : 'text-cream/50 hover:text-cream hover:bg-white/5'
                  }`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {d}d
                </button>
              ))}
            </div>

            <PlaidConnect onSuccess={onPlaidSuccess} />
          </div>
        </div>
      </header>

      {!hasAccounts && !loading ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4">
          <div className="text-center">
            <div className="text-5xl mb-4 opacity-20">◎</div>
            <h1
              className="text-3xl text-cream mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Connect your bank
            </h1>
            <p className="text-sm opacity-40 max-w-sm">
              Link your accounts via Plaid to see your spending breakdown and transaction history.
            </p>
          </div>
          <PlaidConnect onSuccess={onPlaidSuccess} />

          {/* Sandbox hint */}
          <div
            className="card px-6 py-4 text-xs max-w-sm text-center"
            style={{ borderColor: 'var(--gold)33' }}
          >
            <p className="text-gold mb-2 tracking-widest uppercase text-xs">Sandbox Mode</p>
            <p className="opacity-50 leading-relaxed">
              When prompted, select any institution and use:
            </p>
            <div className="mt-2 flex justify-center gap-4">
              <span className="text-gold">user_good</span>
              <span className="opacity-30">/</span>
              <span className="text-gold">pass_good</span>
            </div>
          </div>
        </div>
      ) : (
        /* ── Dashboard ── */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Tab nav */}
          <div className="flex gap-0 border-b border-ink-soft mb-6">
            {(['overview', 'transactions', 'accounts'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2.5 text-xs tracking-widest uppercase transition-colors relative ${
                  activeTab === t ? 'text-gold' : 'text-cream/40 hover:text-cream/70'
                }`}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {t}
                {activeTab === t && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'var(--gold)' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-12 gap-4 stagger-children">
              {/* Stat cards */}
              <div className="col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3 fade-up">
                <StatCard
                  label="Net Worth"
                  value={totalBalanceFormatted}
                  sub={`${data?.accounts.length ?? 0} accounts`}
                  accent
                  delay={0}
                />
                <StatCard
                  label="Monthly Spend"
                  value={monthlySpendFormatted}
                  sub={`Last ${dateRange} days`}
                  delay={0.05}
                />
                <StatCard
                  label="Transactions"
                  value={txCount.toString()}
                  sub="Settled"
                  delay={0.1}
                />
                <StatCard
                  label="Categories"
                  value={(data?.spendingByCategory.length ?? 0).toString()}
                  sub="Active"
                  delay={0.15}
                />
              </div>

              {/* Spending donut */}
              <div className="col-span-12 md:col-span-5 card p-5 fade-up" style={{ animationDelay: '0.2s' }}>
                <p
                  className="text-xs opacity-40 tracking-widest uppercase mb-4"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Spending Breakdown
                </p>
                {data && data.spendingByCategory.length > 0 ? (
                  <SpendingChart data={data.spendingByCategory} />
                ) : (
                  <div className="h-40 flex items-center justify-center opacity-30 text-xs">
                    {loading ? 'Loading...' : 'No data yet'}
                  </div>
                )}
              </div>

              {/* Monthly chart */}
              <div className="col-span-12 md:col-span-7 card p-5 fade-up" style={{ animationDelay: '0.25s' }}>
                <p
                  className="text-xs opacity-40 tracking-widest uppercase mb-4"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Monthly Spending
                </p>
                {data && data.monthlySpending.length > 0 ? (
                  <MonthlyChart data={data.monthlySpending} />
                ) : (
                  <div className="h-40 flex items-center justify-center opacity-30 text-xs">
                    {loading ? 'Loading...' : 'No history yet'}
                  </div>
                )}
              </div>

              {/* Top merchants */}
              <div className="col-span-12 md:col-span-5 card p-5 fade-up" style={{ animationDelay: '0.3s' }}>
                <p
                  className="text-xs opacity-40 tracking-widest uppercase mb-4"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Top Merchants
                </p>
                {data?.topMerchants.length ? (
                  <div className="flex flex-col gap-3">
                    {data.topMerchants.map((m, i) => {
                      const maxTotal = data.topMerchants[0].total
                      const pct = (m.total / maxTotal) * 100
                      return (
                        <div key={m.name} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-cream/70 truncate">{m.name}</span>
                            <span className="text-xs text-gold ml-2 flex-shrink-0 font-mono">
                              ${m.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="h-0.5 bg-ink-soft rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bar-fill"
                              style={{
                                '--target-width': `${pct}%`,
                                background: 'var(--gold)',
                                opacity: 1 - i * 0.15,
                                width: `${pct}%`,
                              } as any}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs opacity-30 text-center py-4">
                    {loading ? 'Loading...' : 'No data'}
                  </p>
                )}
              </div>

              {/* Recent transactions (mini) */}
              <div className="col-span-12 md:col-span-7 card p-5 fade-up" style={{ animationDelay: '0.35s' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs opacity-40 tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                    Recent Activity
                  </p>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs text-gold/60 hover:text-gold transition-colors hover-underline"
                  >
                    View all →
                  </button>
                </div>
                {data ? (
                  <TransactionList
                    transactions={data.transactions.slice(0, 8)}
                    onCategoryFilter={setCategoryFilter}
                    activeCategory={categoryFilter}
                  />
                ) : (
                  <p className="text-xs opacity-30 text-center py-4">
                    {loading ? 'Loading...' : 'No transactions'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── TRANSACTIONS TAB ── */}
          {activeTab === 'transactions' && (
            <div className="card p-5 fade-up">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs opacity-40 tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                  All Transactions
                  {data && (
                    <span className="ml-2 text-gold/60">({data.transactions.length})</span>
                  )}
                </p>
              </div>
              {data ? (
                <TransactionList
                  transactions={data.transactions}
                  onCategoryFilter={setCategoryFilter}
                  activeCategory={categoryFilter}
                />
              ) : (
                <p className="text-xs opacity-30 text-center py-8">
                  {loading ? 'Loading transactions...' : 'No transactions found'}
                </p>
              )}
            </div>
          )}

          {/* ── ACCOUNTS TAB ── */}
          {activeTab === 'accounts' && (
            <div className="grid grid-cols-12 gap-4 stagger-children">
              <div className="col-span-12 md:col-span-6 card p-5 fade-up">
                <p className="text-xs opacity-40 tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                  Linked Accounts
                </p>
                <AccountCards accounts={data?.accounts ?? []} />

                <div className="mt-6 pt-4 border-t border-ink-soft">
                  <PlaidConnect onSuccess={onPlaidSuccess} />
                </div>
              </div>

              <div className="col-span-12 md:col-span-6 card p-5 fade-up" style={{ animationDelay: '0.1s' }}>
                <p className="text-xs opacity-40 tracking-widest uppercase mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                  Balance Summary
                </p>

                {data?.accounts.length ? (
                  <div className="flex flex-col gap-4">
                    {/* Group by type */}
                    {['depository', 'credit', 'investment', 'loan'].map((type) => {
                      const accts = data.accounts.filter((a: any) => a.type === type)
                      if (!accts.length) return null
                      const total = accts.reduce(
                        (s: number, a: any) => s + (parseFloat(a.current_balance) || 0),
                        0
                      )
                      return (
                        <div key={type} className="flex items-center justify-between py-2 border-b border-ink-soft">
                          <div>
                            <p className="text-xs text-cream/70 capitalize">{type}</p>
                            <p className="text-xs opacity-30">{accts.length} account{accts.length !== 1 ? 's' : ''}</p>
                          </div>
                          <p
                            className={`text-sm font-medium ${type === 'credit' && total > 0 ? 'text-coral' : 'text-jade-light'}`}
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            ${Math.abs(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )
                    })}

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs opacity-60 uppercase tracking-wider">Net Total</p>
                      <p
                        className="text-lg text-gold"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {totalBalanceFormatted}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs opacity-30 text-center py-8">No accounts yet</p>
                )}
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="text-xs opacity-30 tracking-widest pulse"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                SYNCING ●
              </div>
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-ink-soft/30 mt-12 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs opacity-20">
            Powered by Plaid Sandbox · PostgreSQL
          </p>
          <p className="text-xs opacity-20">
            Data is for demonstration purposes only
          </p>
        </div>
      </footer>
    </div>
  )
}
