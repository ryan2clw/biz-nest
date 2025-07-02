"use client";

import styles from './DashDetail.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';
import Image from 'next/image';
import Link from 'next/link';

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: string | null;
  // Convenience fields from profile
  firstName?: string | null;
  lastName?: string | null;
  screenName?: string | null;
  industry?: string | null;
  profile?: {
    id: number;
    firstName?: string | null;
    lastName?: string | null;
    screenName?: string | null;
    industry?: string | null;
    userId: number;
    role: 'admin' | 'customer' | 'user';
  } | null;
}

interface DashDetailProps {
  heading: string;
  user?: User; // Optional prop for when used in user detail page
}

export default function DashDetail({ heading, user }: DashDetailProps) {
  // Use the updated Redux state structure
  const reduxUser = useSelector((state: RootState) => state.admin.selectedUser);
  // Use provided user prop or fall back to Redux state
  const currentUser = user || reduxUser;

  if (!currentUser) {
    return (
      <div className={styles.dashDetail}>
        <h3>{heading}</h3>
        <div className={styles.emptyState}>
          <p>Select a user to view details</p>
        </div>
      </div>
    );
  }

  const getUserDisplayName = () => {
    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    if (currentUser.firstName) {
      return currentUser.firstName;
    }
    if (currentUser.lastName) {
      return currentUser.lastName;
    }
    if (currentUser.name) {
      return currentUser.name;
    }
    return currentUser.email || 'Unknown User';
  };

  return (
    <div className={styles.dashDetail}>
      <h3>{heading}</h3>
      
      <div className={styles.userCard}>
        <div className={styles.userHeader}>
          {currentUser.image && (
            <Image 
              src={currentUser.image} 
              alt={getUserDisplayName()} 
              width={80}
              height={80}
              className={styles.userAvatar}
            />
          )}
          <div className={styles.userInfo}>
            <h4 className={styles.userName}>{getUserDisplayName()}</h4>
            <p className={styles.userEmail}>{currentUser.email || 'No email'}</p>
          </div>
        </div>

        <div className={styles.userDetails}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>ID:</span>
            <span className={styles.detailValue}>{currentUser.id}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>First Name:</span>
            <span className={styles.detailValue}>{currentUser.firstName || 'Not provided'}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Last Name:</span>
            <span className={styles.detailValue}>{currentUser.lastName || 'Not provided'}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Screen Name:</span>
            <span className={styles.detailValue}>{currentUser.screenName || 'Not provided'}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Industry:</span>
            <span className={styles.detailValue}>{currentUser.industry || 'Not provided'}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Role:</span>
            <span className={styles.detailValue}>{currentUser.profile?.role || 'Not assigned'}</span>
          </div>
          
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email Verified:</span>
            <span className={styles.detailValue}>
              {currentUser.emailVerified ? 'Yes' : 'No'}
            </span>
          </div>
          
          {currentUser.emailVerified && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Verified Date:</span>
              <span className={styles.detailValue}>
                {new Date(currentUser.emailVerified).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Only show View Details link if we're not already on the user detail page */}
        {!user && (
          <div className={styles.viewDetailsLink}>
            <Link href={`/admin/user-detail/${currentUser.id}`} className={styles.link}>
              View Details →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 