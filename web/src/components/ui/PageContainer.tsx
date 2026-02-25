import { ReactNode } from 'react'

interface PageContainerProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

export default function PageContainer({ title, description, action, children }: PageContainerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  )
}

/* PageContainer.tsx */
