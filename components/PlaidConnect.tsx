'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePlaidLink, PlaidLinkOptions } from 'react-plaid-link'

interface PlaidConnectProps {
  onSuccess: () => void
}

export function PlaidConnect({ onSuccess }: PlaidConnectProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/create-link-token', { method: 'POST' })
      .then((r) => r.json())
      .then((data) => setLinkToken(data.link_token))
      .catch(() => setError('Failed to initialize Plaid'))
  }, [])

  const handleSuccess = useCallback(
    async (public_token: string, metadata: any) => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_token,
            institution: metadata.institution,
          }),
        })
        if (!res.ok) throw new Error('Exchange failed')
        onSuccess()
      } catch {
        setError('Failed to link account. Please try again.')
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess]
  )

  const config: PlaidLinkOptions = {
    token: linkToken ?? '',
    onSuccess: handleSuccess,
    onExit: (err) => {
      if (err) setError(err.display_message ?? 'Connection cancelled')
    },
  }

  const { open, ready } = usePlaidLink(config)

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => open()}
        disabled={!ready || isLoading}
        className="group relative px-8 py-4 text-sm tracking-widest uppercase transition-all duration-300
                   border border-gold text-gold hover:bg-gold hover:text-ink
                   disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="pulse">●</span> Linking...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>+</span> Connect Bank Account
          </span>
        )}
      </button>

      {error && (
        <p className="text-xs text-coral opacity-80">{error}</p>
      )}

      <p className="text-xs opacity-40 text-center max-w-xs">
        Using Plaid Sandbox — use credentials{' '}
        <span className="text-gold">user_good</span> /{' '}
        <span className="text-gold">pass_good</span>
      </p>
    </div>
  )
}
