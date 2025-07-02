import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { useSession } from 'next-auth/react';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useIsAuthorized(requiredRole: string = 'admin') {
  const { data: session, status } = useSession();
  if (status !== 'authenticated') return false;
  const userRole = (session?.user as { profile?: { role?: string } })?.profile?.role;
  return userRole === requiredRole;
} 