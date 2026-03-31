"use client";

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import { store } from '../../redux/store';
import NavBar from '../NavBar/NavBar';
import ScreenNameUpdater from '../ScreenNameUpdater/ScreenNameUpdater';
import ThemeProvider from '../ThemeProvider/ThemeProvider';
import ThemeSync from '../ThemeProvider/ThemeSync';
import { closeMenu, setTheme } from '../../redux/slices/appSlice';

interface ClientProvidersProps {
  children: ReactNode;
  initialTheme: 'dark' | 'light';
}

export default function ClientProviders({ children, initialTheme }: ClientProvidersProps) {
  store.dispatch(setTheme(initialTheme));

  const handleBodyClick = () => {
    store.dispatch(closeMenu());
  };

  return (
    <Provider store={store}>
      <SessionProvider>
        <ThemeSync />
        <ThemeProvider />
        <ScreenNameUpdater />
        <div onClick={handleBodyClick} style={{ width: '100%' }}>
          <NavBar />
          {children}
        </div>
      </SessionProvider>
    </Provider>
  );
}
