import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="stack compact-stack" style={{ gap: '0.35rem' }}>
        {label && (
          <label htmlFor={inputId} className="eyebrow" style={{ marginBottom: 0 }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={className}
          {...props}
        />
        {error && <span className="error" style={{ fontSize: '0.8rem' }}>{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
