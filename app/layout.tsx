"use client";

import '../styles/globals.css';
import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
} 