"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  industry?: string | null;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface DashboardProps {
  users: User[];
  pagination: PaginationInfo | null;
  onPageChange: (page: number) => void;
}

export default function Dashboard({ users, pagination, onPageChange }: DashboardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleRowClick = (user: User) => {
    dispatch(setCurrentUser(user));
    // Smooth scroll to top to reveal the DashDetail component
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (user: User) => {
    router.push(`/admin/user-detail/${user.id}`);
  };

  const getUserDisplayName = (user: User) => {
    if (user.screenName) return user.screenName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email || 'Unknown User';
  };

  const renderPageNumbers = () => {
    if (!pagination) return null;

    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.currentPage;

    // Always show first page
    pages.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        className={`${styles.pageButton} ${current === 1 ? styles.active : ''}`}
      >
        1
      </button>
    );

    // Show ellipsis if there's a gap
    if (current > 4) {
      pages.push(<span key="ellipsis1" className={styles.ellipsis}>...</span>);
    }

    // Show pages around current page
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
      if (i > 1 && i < totalPages) {
        pages.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={`${styles.pageButton} ${current === i ? styles.active : ''}`}
          >
            {i}
          </button>
        );
      }
    }

    // Show ellipsis if there's a gap
    if (current < totalPages - 3) {
      pages.push(<span key="ellipsis2" className={styles.ellipsis}>...</span>);
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`${styles.pageButton} ${current === totalPages ? styles.active : ''}`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>User Management</h1>
        <p>Manage and view user accounts</p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Industry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr 
                key={user.id} 
                className={styles.tableRow}
                onClick={() => handleRowClick(user)}
              >
                <td className={styles.userCell}>
                  <div className={styles.userInfo}>
                    {user.image && (
                      <Image
                        src={user.image}
                        alt={getUserDisplayName(user)}
                        width={40}
                        height={40}
                        className={styles.userAvatar}
                      />
                    )}
                    <span className={styles.userName}>{getUserDisplayName(user)}</span>
                  </div>
                </td>
                <td>{user.email || 'No email'}</td>
                <td>{user.industry || 'Not specified'}</td>
                <td>
                  <button
                    className={styles.actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(user);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            <span>
              Showing {((pagination.currentPage - 1) * 25) + 1} to {Math.min(pagination.currentPage * 25, pagination.totalUsers)} of {pagination.totalUsers} users
            </span>
          </div>
          
          <div className={styles.paginationControls}>
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className={styles.pageButton}
            >
              ←
            </button>
            
            {renderPageNumbers()}
            
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={styles.pageButton}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 