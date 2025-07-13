"use client";

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';
import styles from './UserForm.module.scss';

interface UserFormProps {
  onUpdate?: () => void;
}

export default function UserForm({ onUpdate }: UserFormProps) {
  const user = useSelector((state: RootState) => state.app.selectedUser);
  const [screenName, setScreenName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setScreenName(user.profile?.screenName || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/update-screen-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          screenName,
        }),
      });

      if (response.ok) {
        setMessage('Screen name updated successfully!');
        onUpdate?.();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to update screen name');
      }
    } catch {
      setMessage('An error occurred while updating screen name');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className={styles.container}>No user selected</div>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Update Screen Name</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="screenName">Screen Name:</label>
          <input
            type="text"
            id="screenName"
            value={screenName}
            onChange={(e) => setScreenName(e.target.value)}
            className={styles.input}
            placeholder="Enter screen name"
          />
        </div>

        <button type="submit" disabled={isLoading} className={styles.button}>
          {isLoading ? 'Updating...' : 'Update Screen Name'}
        </button>

        {message && (
          <div className={`${styles.message} ${message.includes('success') ? styles.success : styles.error}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
} 