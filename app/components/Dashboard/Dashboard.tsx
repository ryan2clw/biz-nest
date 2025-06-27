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
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Dashboard({ users, pagination, currentPage, onPageChange }: DashboardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const getUserDisplayName = (user: User) => {
    if (user.screenName) return user.screenName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    return user.email || 'Unknown User';
  };

  const handleRowClick = (user: User) => {
    dispatch(setCurrentUser(user));
    
    // Scroll to top to show the DashDetail component
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleViewDetails = (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from firing
    router.push(`/admin/user-detail?id=${user.id}`);
  };

  const renderPagination = () => {
    if (!pagination) {
      // Show basic pagination info even without full pagination data
      return (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Showing {users.length} users
          </span>
        </div>
      );
    }

    const { totalPages, hasNextPage, hasPrevPage } = pagination;
    
    // Generate page numbers to show
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        // Show all pages if total is 5 or less
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show current page and surrounding pages
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, currentPage + 2);
        
        // Adjust if we're near the beginning or end
        if (currentPage <= 3) {
          end = Math.min(totalPages, 5);
        } else if (currentPage >= totalPages - 2) {
          start = Math.max(1, totalPages - 4);
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    };

    const pageNumbers = getPageNumbers();
    
    return (
      <div className={styles.pagination}>
        <button 
          className={styles.paginationButton}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          aria-label="Previous page"
        >
          ‹
        </button>
        
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            className={`${styles.pageButton} ${pageNum === currentPage ? styles.activePage : ''}`}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        ))}
        
        <button 
          className={styles.paginationButton}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
        >
          ›
        </button>
        
        <span className={styles.pageInfo}>
          Page {currentPage} of {totalPages} ({pagination.totalUsers} total users)
        </span>
      </div>
    );
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2 className={styles.title}>User Management</h2>
        <p className={styles.subtitle}>
          {pagination ? `Total Users: ${pagination.totalUsers}` : `Users: ${users.length}`}
        </p>
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Name</th>
              <th>Industry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr 
                key={user.id} 
                className={styles.clickableRow}
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
                <td>{user.industry || 'Not specified'}</td>
                <td>
                  <button 
                    className={styles.actionButton}
                    onClick={(e) => handleViewDetails(user, e)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {renderPagination()}
    </div>
  );
} 