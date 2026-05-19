import { useState } from 'react'

export function RoomCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      title="Click to copy"
      className="secondary"
      style={{ display: 'inline-flex', gap: '0.75rem', alignItems: 'center', width: 'auto' }}
    >
      <span className="lobby-code-display" style={{ pointerEvents: 'none' }}>{code}</span>
      <span className="muted" style={{ fontSize: '0.82rem' }}>{copied ? '✓ Copied' : 'Copy'}</span>
    </button>
  )
}
