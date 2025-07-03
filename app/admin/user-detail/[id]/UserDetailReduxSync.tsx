"use client";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedUser } from '../../../../src/lib/slices/appSlice';
import type { User } from '../../../../src/interfaces/app';

export default function UserDetailReduxSync({ user }: { user: User }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setSelectedUser(user));
  }, [dispatch, user]);
  return null;
} 