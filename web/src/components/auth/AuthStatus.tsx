import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthStatusProps {
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'error';
  title: string;
  description: ReactNode;
  children?: ReactNode;
}

export function AuthStatus({ icon: Icon, variant = 'primary', title, description, children }: AuthStatusProps) {
  const variants = {
    primary: {
      bg: 'bg-primary-soft',
      color: 'text-primary',
    },
    success: {
      bg: 'bg-success-soft',
      color: 'text-success',
    },
    error: {
      bg: 'bg-error-soft',
      color: 'text-error',
    },
  };

  const colors = variants[variant];

  return (
    <div className="flex flex-col">
      <div className={`w-12 h-12 rounded-lg ${colors.bg} ${colors.color} grid place-items-center mb-[18px]`}>
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <h1 className="text-2xl font-semibold -tracking-[0.02em] mb-1.5">{title}</h1>
      <div className="text-sm text-ink2 mb-7 leading-normal">
        {description}
      </div>
      {children}
    </div>
  );
}

/* AuthStatus.tsx */