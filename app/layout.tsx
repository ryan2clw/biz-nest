import '../styles/globals.css';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import ClientProviders from '../src/components/ClientProviders/ClientProviders';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'dark';

  return (
    <html lang="en">
      <head />
      <body className={`${inter.className} ${theme === 'dark' ? 'dark' : ''}`}>
        <ClientProviders initialTheme={theme === 'light' ? 'light' : 'dark'}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
