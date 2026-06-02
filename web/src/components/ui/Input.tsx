import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-text-primary mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full px-3.5 py-2.5 
            bg-background-card border border-border-default rounded-md 
            text-text-primary placeholder-text-muted
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-background-app disabled:cursor-not-allowed
            transition-shadow duration-200
            ${error ? 'border-danger-text focus:ring-danger-text' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm font-medium text-danger-text">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

/* Input.tsx */