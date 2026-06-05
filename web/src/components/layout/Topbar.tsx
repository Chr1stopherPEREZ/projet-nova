import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface TopbarProps {
  title?: string;
  breadcrumb?: string[];
  action?: React.ReactNode;
  onMenuClick?: () => void;
}

export function Topbar({ title, breadcrumb, action, onMenuClick }: TopbarProps) {
  return (
    <header className="flex items-center gap-4 h-[60px] px-7 bg-surface border-b border-border shrink-0">
      {/* Burger menu for mobile */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-1 -ml-1 text-ink2 hover:text-ink transition-colors"
      >
        <Menu size={20} />
      </button>

      {breadcrumb ? (
        <nav className="flex items-center gap-2 text-[13.5px]">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-ink3">/</span>}
              <span className={index === breadcrumb.length - 1 ? 'font-semibold text-ink' : 'text-ink2'}>
                {item}
              </span>
            </React.Fragment>
          ))}
        </nav>
      ) : (
        <h1 className="text-[15px] font-semibold text-ink">{title}</h1>
      )}

      <div className="ml-auto flex items-center gap-2.5">
        <div className="relative w-60 hidden md:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3">
            <Search size={14} strokeWidth={2} />
          </span>
          <input 
            className="h-[34px] w-full rounded-md border border-border bg-surface pl-9 pr-12 text-[13.5px] outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all" 
            placeholder="Rechercher..." 
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[11px] bg-muted border border-border rounded px-1.5 text-ink2 select-none">
            ⌘K
          </span>
        </div>
        <button className="grid place-items-center w-[34px] h-[34px] rounded-md border border-border text-ink2 hover:bg-muted hover:text-ink transition-colors">
          <Bell size={16} strokeWidth={1.8} />
        </button>
        {action}
      </div>
    </header>
  );
}

/* Topbar.tsx */