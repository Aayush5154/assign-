'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Clapperboard,
  Heart,
  LayoutDashboard,
  MessagesSquare,
  Newspaper,
  Settings,
  Sparkles,
  TrendingUp,
  Zap,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/format';

const NAV = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/feed', label: 'Personalized Feed', icon: Sparkles },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/favorites', label: 'Favorites', icon: Heart },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/movies', label: 'Movies', icon: Clapperboard },
  { href: '/social', label: 'Social', icon: MessagesSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      aria-label="Primary navigation"
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface transition-all duration-300 lg:flex',
        collapsed ? 'w-[72px]' : 'w-60',
      )}
    >
      <div className="flex items-center gap-2.5 px-4 pb-2 pt-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent" aria-hidden="true">
          <Zap className="h-5 w-5 text-accent-fg" />
        </span>
        {!collapsed && (
          <span className="truncate text-[17px] font-bold tracking-tight text-primary">
            PulseBoard
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Sections">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-accent text-accent-fg'
                  : 'text-secondary hover:bg-[var(--hover)] hover:text-primary',
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-3 rounded-xl border border-border bg-card p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Activity className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> Demo mode
          </p>
          <p className="mt-1 text-xs leading-relaxed text-secondary">
            Preferences are stored locally in this browser. Add API keys for live data.
          </p>
        </div>
      )}

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-secondary transition hover:bg-[var(--hover)] hover:text-primary"
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" /> Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
