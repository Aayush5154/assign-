'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Clapperboard,
  Heart,
  LayoutDashboard,
  MessagesSquare,
  Newspaper,
  Settings,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
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

export default function MobileNavigation({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.22 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface lg:hidden"
            aria-label="Mobile navigation"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between px-4 pb-2 pt-5">
              <span className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
                  <Zap className="h-5 w-5 text-accent-fg" aria-hidden="true" />
                </span>
                <span className="text-[17px] font-bold text-primary">PulseBoard</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-secondary hover:bg-[var(--hover)] hover:text-primary"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Sections">
              {NAV.map((item) => {
                const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                      active
                        ? 'bg-accent text-accent-fg'
                        : 'text-secondary hover:bg-[var(--hover)] hover:text-primary',
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
