import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const accounts = await query(
      `SELECT a.*, pi.institution_name
       FROM accounts a
       JOIN plaid_items pi ON pi.id = a.item_id
       ORDER BY a.type, a.name`
    )
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Accounts fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}
