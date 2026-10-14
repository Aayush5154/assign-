'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNavigation from '@/components/layout/MobileNavigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-primary">
      <Sidebar />
      <MobileNavigation open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8" id="main-content">
          {children}
        </main>
        <footer className="border-t border-border px-4 py-4 text-xs text-secondary sm:px-6 lg:px-8">
          <p>
            PulseBoard · Movie data by{' '}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
              TMDB
            </a>
            . Social posts are clearly labeled demos. News via NewsAPI when configured.
          </p>
        </footer>
      </div>
    </div>
  );
}
