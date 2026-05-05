'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface MonthlySpending {
  month: string
  total: number
}

interface MonthlyChartProps {
  data: MonthlySpending[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.[0]) return null
  return (
    <div className="card px-3 py-2 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
      <p className="opacity-60 mb-1">{label}</p>
      <p className="text-gold font-medium">${payload[0].value.toFixed(2)}</p>
    </div>
  )
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={20}>
        <CartesianGrid
          vertical={false}
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="month"
          tick={{ fill: 'rgba(245,240,232,0.4)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(245,240,232,0.4)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,168,76,0.08)' }} />
        <Bar dataKey="total" fill="#C9A84C" opacity={0.8} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
