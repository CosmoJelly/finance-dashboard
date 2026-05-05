interface StatCardProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
  delay?: number
}

export function StatCard({ label, value, sub, accent, delay = 0 }: StatCardProps) {
  return (
    <div
      className={`card px-5 py-4 fade-up ${accent ? 'card-gold' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <p className="text-xs opacity-40 tracking-widest uppercase mb-2">{label}</p>
      <p
        className={`text-2xl font-display ${accent ? 'shimmer-text' : 'text-cream'}`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </p>
      {sub && <p className="text-xs opacity-40 mt-1">{sub}</p>}
    </div>
  )
}
