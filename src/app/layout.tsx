import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Cairo } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Wherio (ويريو) — Admin, Data Quality & Governance Portal',
  description:
    'Backoffice governance portal for Wherio Phase 1 MVP: 100-place launch readiness in Abu Dhabi & Riyadh, data completeness scoring, duplicate detection, review moderation, and city activation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${cairo.variable}`}>
      <body className="antialiased selection:bg-[#0072DC] selection:text-white">
        {children}
      </body>
    </html>
  );
}
