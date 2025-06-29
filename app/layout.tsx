"use client";

import '../styles/globals.css';
import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import { store } from './lib/store';
import NavBar from './components/NavBar/NavBar';
import ScreenNameUpdater from './components/ScreenNameUpdater/ScreenNameUpdater';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <Provider store={store}>
          <SessionProvider>
            <ScreenNameUpdater />
            <NavBar />
            {children}
          </SessionProvider>
        </Provider>
      </body>
    </html>
  );
} 