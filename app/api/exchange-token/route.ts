import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { public_token, institution } = await req.json()

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    })

    const { access_token, item_id } = exchangeResponse.data

    // Store item in DB
    const [item] = await query<{ id: number }>(
      `INSERT INTO plaid_items (user_id, item_id, access_token, institution_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (item_id) DO UPDATE SET access_token = $3, institution_name = $4
       RETURNING id`,
      ['default_user', item_id, access_token, institution?.name ?? 'Unknown Bank']
    )

    // Fetch accounts
    const accountsResponse = await plaidClient.accountsGet({ access_token })

    for (const acct of accountsResponse.data.accounts) {
      await query(
        `INSERT INTO accounts (item_id, account_id, name, official_name, type, subtype,
          current_balance, available_balance, currency_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (account_id) DO UPDATE SET
           current_balance = $7, available_balance = $8, updated_at = NOW()`,
        [
          item.id,
          acct.account_id,
          acct.name,
          acct.official_name ?? null,
          acct.type,
          acct.subtype ?? null,
          acct.balances.current ?? null,
          acct.balances.available ?? null,
          acct.balances.iso_currency_code ?? 'USD',
        ]
      )
    }

    // Initial transaction sync (last 30 days)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    const endDate = new Date()

    const txResponse = await plaidClient.transactionsGet({
      access_token,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      options: { count: 500 },
    })

    for (const tx of txResponse.data.transactions) {
      // Find the internal account id
      const [acct] = await query<{ id: number }>(
        'SELECT id FROM accounts WHERE account_id = $1',
        [tx.account_id]
      )
      if (!acct) continue

      await query(
        `INSERT INTO transactions
          (account_id, transaction_id, amount, date, name, merchant_name,
           category, primary_category, pending, currency_code)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (transaction_id) DO NOTHING`,
        [
          acct.id,
          tx.transaction_id,
          tx.amount,
          tx.date,
          tx.name,
          tx.merchant_name ?? null,
          tx.category ?? [],
          tx.category?.[0] ?? 'Other',
          tx.pending,
          tx.iso_currency_code ?? 'USD',
        ]
      )
    }

    return NextResponse.json({ success: true, item_id })
  } catch (error: any) {
    console.error('Exchange token error:', error.response?.data ?? error)
    return NextResponse.json(
      { error: 'Failed to link account' },
      { status: 500 }
    )
  }
}
