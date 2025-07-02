"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DashDetail from '../../../components/DashDetail/DashDetail';
import ProfileForm from '../../../components/ProfileForm/ProfileForm';
import DangerForm from '../../../components/DangerForm/DangerForm';
import styles from '../page.module.scss';
import UserDetailReduxSync from './UserDetailReduxSync';
import withAuth from '../../../components/withAuth';
import type { User } from '../../../lib/slices/adminSlice';

function UserDetailPage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!params?.id) {
        setError(true);
        setLoading(false);
        return;
      }
      
      const userId = parseInt(params.id as string);
      
      if (isNaN(userId)) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/admin/users/${userId}`);
        if (!response.ok) {
          setError(true);
          setLoading(false);
          return;
        }

        const userData = await response.json();
        const userWithProfile = {
          ...userData,
          emailVerified: userData.emailVerified || null,
          firstName: userData.profile?.firstName || null,
          lastName: userData.profile?.lastName || null,
          screenName: userData.profile?.screenName || null,
          industry: userData.profile?.industry || null
        };
        
        setUser(userWithProfile);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params?.id]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading user details...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        User not found
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <UserDetailReduxSync user={user} />
      <div className={styles.header}>
        <h1>User Profile and History</h1>
      </div>
      <div className={styles.content}>
        <DashDetail heading="User Details" user={user} />
        <div className={styles.formsContainer}>
          <ProfileForm />
          <DangerForm userId={user.id} />
        </div>
      </div>
    </div>
  );
}

export default withAuth(UserDetailPage, 'admin'); 