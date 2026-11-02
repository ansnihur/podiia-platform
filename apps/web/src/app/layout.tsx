import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/unbounded';
import '@fontsource-variable/onest';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Providers } from '@/components/providers';

// Fonts are self-hosted (Fontsource): no request to Google, Cyrillic included.

export const metadata: Metadata = {
  title: { default: 'Podїa — куди підемо сьогодні?', template: '%s · Podїa' },
  description: 'Від посиденьок на вісьмох до фестивалів на тисячі — усі події міста, підібрані під тебе.',
};
export const viewport: Viewport = { themeColor: '#2A0E10' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className="flex min-h-screen flex-col">
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
            До змісту
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
