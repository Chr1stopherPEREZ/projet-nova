import React from 'react';
import { Search, Bell } from 'lucide-react';

interface TopbarProps {
  title: string;
  action?: React.ReactNode;
}

export function Topbar({ title, action }: TopbarProps) {
  return (
    <header className="flex items-center gap-4 h-[60px] px-7 bg-surface border-b border-border shrink-0">
      <h1 className="text-[15px] font-semibold text-ink">{title}</h1>
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