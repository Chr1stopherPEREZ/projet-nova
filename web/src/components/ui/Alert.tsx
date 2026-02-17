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
  success: 'bg-success-50 border-success-500 text-success-700',
  warning: 'bg-warning-50 border-warning-500 text-warning-700',
  danger: 'bg-danger-50 border-danger-500 text-danger-700',
  info: 'bg-info-50 border-info-500 text-info-700',
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