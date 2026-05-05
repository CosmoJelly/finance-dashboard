import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { CATEGORY_CONFIG } from '@/lib/plaid'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const offset = parseInt(searchParams.get('offset') ?? '0')
    const category = searchParams.get('category')
    const days = parseInt(searchParams.get('days') ?? '30')

    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - days)
    const sinceDateStr = sinceDate.toISOString().split('T')[0]

    // Transactions list
    let txQuery = `
      SELECT t.*, a.name as account_name, a.type as account_type
      FROM transactions t
      JOIN accounts a ON a.id = t.account_id
      WHERE t.date >= $1 AND t.pending = false
    `
    const params: any[] = [sinceDateStr]

    if (category) {
      params.push(category)
      txQuery += ` AND t.primary_category = $${params.length}`
    }

    txQuery += ` ORDER BY t.date DESC, t.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const transactions = await query(txQuery, params)

    // Spending by category (expenses only — positive amounts)
    const categoryRows = await query(
      `SELECT primary_category, SUM(amount) as total, COUNT(*) as count
       FROM transactions
       WHERE date >= $1 AND amount > 0 AND pending = false
       GROUP BY primary_category
       ORDER BY total DESC`,
      [sinceDateStr]
    )

    const spendingByCategory = categoryRows.map((row) => {
      const cfg = CATEGORY_CONFIG[row.primary_category] ?? CATEGORY_CONFIG['Other']
      return {
        category: row.primary_category,
        label: cfg.label,
        total: parseFloat(row.total),
        count: parseInt(row.count),
        color: cfg.color,
        icon: cfg.icon,
      }
    })

    // Monthly spending (last 6 months)
    const monthlyRows = await query(
      `SELECT TO_CHAR(date, 'Mon YYYY') as month,
              DATE_TRUNC('month', date) as month_date,
              SUM(amount) as total
       FROM transactions
       WHERE amount > 0 AND pending = false
         AND date >= NOW() - INTERVAL '6 months'
       GROUP BY month, month_date
       ORDER BY month_date ASC`
    )

    // Top merchants
    const merchantRows = await query(
      `SELECT COALESCE(merchant_name, name) as merchant,
              SUM(amount) as total, COUNT(*) as count
       FROM transactions
       WHERE date >= $1 AND amount > 0 AND pending = false
       GROUP BY merchant
       ORDER BY total DESC
       LIMIT 5`,
      [sinceDateStr]
    )

    // Account balances
    const accounts = await query(
      `SELECT a.*, pi.institution_name
       FROM accounts a
       JOIN plaid_items pi ON pi.id = a.item_id
       ORDER BY a.type, a.name`
    )

    return NextResponse.json({
      transactions,
      spendingByCategory,
      monthlySpending: monthlyRows.map((r) => ({
        month: r.month,
        total: parseFloat(r.total),
      })),
      topMerchants: merchantRows.map((r) => ({
        name: r.merchant,
        total: parseFloat(r.total),
        count: parseInt(r.count),
      })),
      accounts,
      totalBalance: accounts.reduce(
        (sum: number, a: any) => sum + (parseFloat(a.current_balance) || 0),
        0
      ),
      monthlySpend: spendingByCategory.reduce((s: number, c: any) => s + c.total, 0),
    })
  } catch (error: any) {
    console.error('Transactions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
