import { useGameClock } from '../../hooks/useGameClock'

interface Props {
  startedAt: number
  timeLimitMs: number
  onExpire?: () => void
}

export function Timer({ startedAt, timeLimitMs, onExpire }: Props) {
  const { timeRemainingMs, progress } = useGameClock(startedAt, timeLimitMs, onExpire)
  const seconds = Math.ceil(timeRemainingMs / 1000)
  const urgent = seconds <= 5

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-end">
        <span className={`text-xl font-bold font-mono tabular-nums ${urgent ? 'text-red-400' : 'text-gray-300'}`}>
          {seconds}s
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-none ${urgent ? 'bg-red-500' : 'bg-indigo-500'}`}
          style={{ width: `${(1 - progress) * 100}%` }}
        />
      </div>
    </div>
  )
}
