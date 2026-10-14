import type { Metadata } from 'next';
import StoreProvider from '@/store/StoreProvider';
import AppShell from '@/components/layout/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'PulseBoard — Personalized Content Dashboard',
  description:
    'Discover news, movies, and social posts personalized to your interests. Save favorites, search everything, and customize your dashboard.',
  icons: {
    icon: '/favicon.ico',
  },
};

function themeInitScript() {
  return `(function(){try{var t=JSON.parse(localStorage.getItem('pulseboard.theme.v1')||'"dark"');var m=t==='light'?'light':'dark';document.documentElement.dataset.theme=m;if(m==='light'){document.documentElement.classList.add('light')}else{document.documentElement.classList.remove('light')}}catch(e){document.documentElement.dataset.theme='dark'}})();`;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript() }} />
      </head>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-accent-fg"
        >
          Skip to content
        </a>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
