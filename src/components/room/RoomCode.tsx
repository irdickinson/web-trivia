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
      className="flex items-center gap-3 group"
    >
      <span className="text-4xl font-bold font-mono tracking-widest text-white">
        {code}
      </span>
      <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
        {copied ? '✓ Copied' : 'Copy'}
      </span>
    </button>
  )
}
