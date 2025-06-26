"use client";

import '../styles/globals.css';
import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import NavBar from './components/NavBar/NavBar';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <SessionProvider>
          <NavBar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
} 