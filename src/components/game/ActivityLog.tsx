import { useEffect, useRef } from 'react'
import { SystemMessage } from '../../types/game'

interface Props {
  messages: SystemMessage[]
  maxVisible?: number
}

export function ActivityLog({ messages, maxVisible = 50 }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const visible = messages.slice(-maxVisible)

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {visible.map((msg) => (
        <p
          key={msg.id}
          className={`text-xs leading-snug ${
            msg.type === 'override'
              ? 'text-yellow-400'
              : msg.type === 'warning'
                ? 'text-red-400'
                : 'text-gray-500'
          }`}
        >
          {msg.text}
        </p>
      ))}
      {messages.length === 0 && (
        <p className="text-xs text-gray-600">No activity yet.</p>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
