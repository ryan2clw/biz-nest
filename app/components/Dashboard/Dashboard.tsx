"use client";

import Image from 'next/image';
import styles from './Dashboard.module.scss';
import { useAppDispatch } from '../../lib/hooks';
import { setCurrentUser } from '../../lib/slices/adminSlice';

interface User {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
}

interface DashboardProps {
  users: User[];
}

export default function Dashboard({ users }: DashboardProps) {
  const dispatch = useAppDispatch();

  const getUserDisplayName = (user: User) => {
    if (user.screenName) return user.screenName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email || 'Unknown User';
  };

  const handleViewDetails = (user: User) => {
    dispatch(setCurrentUser(user));
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2 className={styles.title}>User Management</h2>
        <p className={styles.subtitle}>Total Users: {users.length}</p>
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Name</th>
              <th>Email Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className={styles.userCell}>
                  <div className={styles.userInfo}>
                    {user.image && (
                      <Image 
                        src={user.image} 
                        alt={getUserDisplayName(user)} 
                        width={40}
                        height={40}
                        className={styles.avatar}
                      />
                    )}
                    <span className={styles.userName}>{getUserDisplayName(user)}</span>
                  </div>
                </td>
                <td>{user.email || 'No email'}</td>
                <td>
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName || user.lastName || 'Not provided'
                  }
                </td>
                <td>{user.emailVerified ? 'Yes' : 'No'}</td>
                <td>
                  <button 
                    className={styles.actionButton}
                    onClick={() => handleViewDetails(user)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 