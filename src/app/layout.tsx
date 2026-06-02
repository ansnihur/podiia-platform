import type { Metadata } from 'next';
import { Playfair_Display, Figtree, Montserrat } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/navbar';
import { FooterWrapper } from '@/components/footer-wrapper';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin', 'cyrillic'], variable: '--font-montserrat', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Podiia — Платформа соціальних і наукових заходів', template: '%s | Podiia' },
  description: 'Відкривайте, реєструйтесь та керуйте заходами на Podiia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${playfair.variable} ${figtree.variable} ${montserrat.variable}`}>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col ua-bg">
            <Navbar />
            <main className="flex-1">{children}</main>
            <FooterWrapper />
          </div>
        </Providers>
      </body>
    </html>
  );
}
