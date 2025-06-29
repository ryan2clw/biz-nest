"use client";

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedUser } from '../../lib/slices/adminSlice';
import styles from './Dashboard.module.scss';

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  // Convenience fields from profile
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  industry?: string | null;
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
    dispatch(setSelectedUser(user));
    
    // Scroll to top to show DashDetail
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (e: React.MouseEvent, user: User) => {
    e.stopPropagation(); // Prevent row click
    setSelectedUserId(user.id);
    dispatch(setSelectedUser(user));
    
    // Scroll to top to show DashDetail
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              <th>Email</th>
              <th>Screen Name</th>
              <th>Industry</th>
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
                  <img
                    src={user.image || '/user.svg'}
                    alt={`${getDisplayName(user)}'s avatar`}
                    className={styles.userAvatar}
                    onError={(e) => {
                      e.currentTarget.src = '/user.svg';
                    }}
                  />
                </td>
                <td>{getDisplayName(user)}</td>
                <td>{user.email || 'N/A'}</td>
                <td>{user.screenName || 'N/A'}</td>
                <td>{user.industry || 'N/A'}</td>
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