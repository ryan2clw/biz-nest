'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './DangerForm.module.scss';

interface DangerFormProps {
  userId?: number;
}

export default function DangerForm({ userId }: DangerFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteUser = async () => {
    if (!userId) {
      alert('User ID is required');
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to delete this user\'s data? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      const result = await response.json();
      alert(`User deleted successfully: ${result.deletedUser.firstName} ${result.deletedUser.lastName}`);
      
      // Redirect to admin page
      router.push('/admin');
      router.refresh();
      
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.dangerForm}>
      <div className={styles.accordion}>
        <button
          className={styles.accordionHeader}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <span className={styles.accordionTitle}>Dangerous Actions</span>
          <span className={`${styles.accordionIcon} ${isOpen ? styles.open : ''}`}>
            ▼
          </span>
        </button>
        
        <div className={`${styles.accordionContent} ${isOpen ? styles.accordionOpen : ''}`}>
          <div className={styles.dangerZone}>
            <p className={styles.warning}>
              ⚠️ These actions are irreversible and will permanently delete user data.
            </p>
            <button
              className={styles.deleteButton}
              onClick={handleDeleteUser}
              disabled={!userId || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete User Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 