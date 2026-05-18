import { HTMLAttributes } from 'react'

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-gray-800 rounded-xl border border-gray-700 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
