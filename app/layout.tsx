"use client";

import '../styles/globals.css';
import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import { store } from '../src/lib/store';
import NavBar from '../src/components/NavBar/NavBar';
import ScreenNameUpdater from '../src/components/ScreenNameUpdater/ScreenNameUpdater';
import ThemeProvider from '../src/components/ThemeProvider/ThemeProvider';
import ThemeSync from '../src/components/ThemeProvider/ThemeSync';

console.log('Rendering app/layout.tsx');

export default function RootLayout({ children }: { children: ReactNode }) {
  try {
    return (
      <html lang="en" className="dark">
        <head />
        <body>
          <Provider store={store}>
            <SessionProvider>
              <ThemeSync />
              <ThemeProvider />
              <ScreenNameUpdater />
              <NavBar />
              {children}
            </SessionProvider>
          </Provider>
        </body>
      </html>
    );
  } catch (error) {
    console.error('Error in app/layout.tsx:', error);
    throw error;
  }
} 