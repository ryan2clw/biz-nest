"use client";
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { setTheme } from '../../redux/slices/appSlice';

interface SessionUser {
  id?: string | number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  profile?: {
    role: string;
    themePreference?: 'dark' | 'light';
  };
}

export default function ThemeSync() {
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const user = session?.user as SessionUser | undefined;
    const pref = user?.profile?.themePreference;
    if (pref === 'dark' || pref === 'light') {
      dispatch(setTheme(pref));
      document.cookie = `theme=${pref};path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;
    }
  }, [session, dispatch]);

  return null;
} 