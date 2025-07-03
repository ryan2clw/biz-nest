"use client";
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../lib/store';
import { setTheme } from '../../lib/slices/appSlice';

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
    }
  }, [session, dispatch]);

  return null;
} 