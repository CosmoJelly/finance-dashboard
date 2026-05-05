'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface SpendingCategory {
  category: string
  label: string
  total: number
  count: number
  color: string
  icon: string
}

interface SpendingChartProps {
  data: SpendingCategory[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div
      className="card px-3 py-2 text-xs"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      <p className="text-cream-muted mb-1">
        {d.icon} {d.label}
      </p>
      <p className="text-gold font-medium">${d.total.toFixed(2)}</p>
      <p className="opacity-50">{d.count} transactions</p>
    </div>
  )
}

export function SpendingChart({ data }: SpendingChartProps) {
  const topCategories = data.slice(0, 8)
  const total = topCategories.reduce((s, d) => s + d.total, 0)

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={topCategories}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="total"
            paddingAngle={2}
            strokeWidth={0}
          >
            {topCategories.map((entry, index) => (
              <Cell key={entry.category} fill={entry.color} opacity={0.85} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {topCategories.map((cat) => {
          const pct = total > 0 ? ((cat.total / total) * 100).toFixed(1) : '0'
          return (
            <div key={cat.category} className="flex items-center gap-2 group">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: cat.color }}
              />
              <span className="text-xs opacity-60 truncate flex-1">{cat.label}</span>
              <span className="text-xs text-gold font-medium">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
