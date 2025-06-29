"use client";

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import Image from 'next/image';
import { setSelectedUser } from '../../lib/slices/adminSlice';
import styles from './Dashboard.module.scss';

// Import the User type from the admin slice for Redux
import type { User as ReduxUser } from '../../lib/slices/adminSlice';

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: string | null; // API returns this as string due to JSON serialization
  // Convenience fields from profile
  firstName?: string | null;
  lastName?: string | null;
  profile?: {
    id: number;
    userId: number;
    firstName?: string | null;
    lastName?: string | null;
    screenName?: string | null;
    industry?: string | null;
  } | null;
}

interface DashboardProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function Dashboard({ users, currentPage, totalPages, onPageChange, onRefresh }: DashboardProps) {
  const dispatch = useDispatch();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const handleRowClick = (user: User) => {
    setSelectedUserId(user.id);
    
    // emailVerified is already a string from the API, no conversion needed
    const serializedUser: ReduxUser = {
      ...user,
      emailVerified: user.emailVerified
    };
    
    dispatch(setSelectedUser(serializedUser));
  };

  const handleViewDetails = (e: React.MouseEvent, user: User) => {
    e.stopPropagation(); // Prevent row click
    setSelectedUserId(user.id);
    
    // emailVerified is already a string from the API, no conversion needed
    const serializedUser: ReduxUser = {
      ...user,
      emailVerified: user.emailVerified
    };
    
    dispatch(setSelectedUser(serializedUser));
  };

  const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.lastName) {
      return user.lastName;
    }
    if (user.name) {
      return user.name;
    }
    return 'Unknown';
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2>User Management</h2>
        <button onClick={onRefresh} className={styles.refreshButton}>
          Refresh
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th className={styles.emailColumn}>Email</th>
              <th className={styles.screenNameColumn}>Screen Name</th>
              <th className={styles.industryColumn}>Industry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                onClick={() => handleRowClick(user)}
                className={`${styles.tableRow} ${selectedUserId === user.id ? styles.selected : ''}`}
              >
                <td>
                  <Image
                    src={user.image || '/user.svg'}
                    alt={`${getDisplayName(user)}'s avatar`}
                    width={40}
                    height={40}
                    className={styles.userAvatar}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/user.svg';
                    }}
                  />
                </td>
                <td>{getDisplayName(user)}</td>
                <td className={styles.emailColumn}>{user.email}</td>
                <td className={styles.screenNameColumn}>{user.profile?.screenName || 'N/A'}</td>
                <td className={styles.industryColumn}>{user.profile?.industry || 'N/A'}</td>
                <td>
                  <button
                    onClick={(e) => handleViewDetails(e, user)}
                    className={styles.actionButton}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            ←
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
} 