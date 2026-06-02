import { HTMLAttributes, ReactNode } from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

type AlertVariant = 'success' | 'warning' | 'danger' | 'info'

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  children: ReactNode
}

const icons: Record<AlertVariant, typeof AlertCircle> = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
}

const variants: Record<AlertVariant, string> = {
  success: 'bg-success-bg border-success-text/20 text-success-text',
  warning: 'bg-warning-bg border-warning-text/20 text-warning-text',
  danger: 'bg-danger-bg border-danger-text/20 text-danger-text',
  info: 'bg-info-bg border-info-text/20 text-info-text',
}

export default function Alert({ variant = 'info', children, className = '', ...props }: AlertProps) {
  const Icon = icons[variant]

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border rounded-md ${variants[variant]} ${className}`}
      role="alert"
      {...props}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="text-sm font-medium">{children}</div>
    </div>
  )
}

/* Alert.tsx */