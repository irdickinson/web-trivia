import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === 'secondary' ? 'secondary' :
    variant === 'ghost' ? 'ghost' :
    variant === 'danger' ? 'danger' : ''

  const sizeClass = size === 'sm' ? 'mini-btn' : size === 'lg' ? 'btn-lg' : ''

  return (
    <button
      disabled={disabled || loading}
      className={[variantClass, sizeClass, className].filter(Boolean).join(' ')}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
          Loading…
        </>
      ) : (
        children
      )}
    </button>
  )
}
