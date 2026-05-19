import { HTMLAttributes } from 'react'

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`panel elevated-panel ${className}`} {...props}>
      {children}
    </div>
  )
}
