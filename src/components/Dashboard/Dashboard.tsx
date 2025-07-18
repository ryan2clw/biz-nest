"use client";

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { setSelectedUser, pushPage } from '../../lib/slices/appSlice';
import styles from './Dashboard.module.scss';

// Import the User type from the interfaces
import type { User as ReduxUser } from '../../interfaces/app';

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
    role: 'admin' | 'customer' | 'user';
  } | null;
}

interface DashboardProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function Dashboard({ users, currentPage, totalPages, onPageChange, onRefresh, isLoading }: DashboardProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768); // iPhone and small mobile devices
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleRowClick = (user: User) => {
    setSelectedUserId(user.id);
    
    const serializedUser: ReduxUser = {
      ...user,
      emailVerified: user.emailVerified || null
    };
    
    dispatch(setSelectedUser(serializedUser));
  };

  const handleViewDetails = (e: React.MouseEvent, user: User) => {
    e.stopPropagation(); // Prevent row click
    setSelectedUserId(user.id);
    
    const serializedUser: ReduxUser = {
      ...user,
      emailVerified: user.emailVerified || null
    };
    
    dispatch(setSelectedUser(serializedUser));
    dispatch(pushPage(pathname || '/'));
    
    // Navigate to user detail page
    router.push(`/admin/user-detail/${user.id}`);
  };

  const getDisplayName = (user: User) => {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    if (user.profile?.firstName) {
      return user.profile.firstName;
    }
    if (user.profile?.lastName) {
      return user.profile.lastName;
    }
    if (user.name) {
      return user.name;
    }
    return 'Unknown';
  };

  const getPaginationButtons = () => {
    const maxButtons = isMobile ? 3 : 5;
    const buttons = [];
    
    if (totalPages <= maxButtons) {
      // Show all buttons if total pages is less than or equal to max
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Show limited buttons with current page in the middle when possible
      let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
      const end = Math.min(totalPages, start + maxButtons - 1);
      
      // Adjust start if we're near the end
      if (end === totalPages) {
        start = Math.max(1, totalPages - maxButtons + 1);
      }
      
      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }
    }
    
    return buttons;
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
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className={styles.spinner}></div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
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
              ))
            )}
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
          
          {getPaginationButtons().map((page) => (
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