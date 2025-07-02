"use client";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedUser } from '../../../lib/slices/adminSlice';
import type { User } from '../../../lib/slices/adminSlice';

export default function UserDetailReduxSync({ user }: { user: User }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setSelectedUser(user));
  }, [dispatch, user]);
  return null;
} 