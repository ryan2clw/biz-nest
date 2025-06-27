"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch } from '../../lib/hooks';
import { setCurrentUser } from '../../lib/slices/adminSlice';
import DashDetail from '../../components/DashDetail/DashDetail';
import Spinner from '../../components/Spinner/Spinner';
import styles from './page.module.scss';

interface User {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  email?: string | null;
  image?: string | null;
  industry?: string | null;
  emailVerified?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  accounts?: Array<{
    provider: string;
    providerAccountId: string;
    createdAt: Date;
  }>;
  sessions?: Array<{
    expires: Date;
    createdAt: Date;
  }>;
}

export default function UserDetailPage() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get('id');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${userId}`);
        const data = await response.json();
        
        if (data.success) {
          setUser(data.user);
          // Set the user in Redux store so DashDetail can access it
          dispatch(setCurrentUser(data.user));
        } else {
          setError('Failed to fetch user details');
        }
      } catch (err) {
        setError('Error fetching user details');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, dispatch]);

  if (loading) {
    return <Spinner />;
  }

  if (error || !user) {
    return (
      <div className={styles.error}>
        <h2>Error</h2>
        <p>{error || 'User not found'}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>User Profile and History</h1>
      </div>
      <DashDetail heading="User Details" />
    </div>
  );
} 