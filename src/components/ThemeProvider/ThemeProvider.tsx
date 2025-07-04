"use client";

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';

export default function ThemeProvider() {
  const theme = useSelector((state: RootState) => state.app.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  return null;
} 