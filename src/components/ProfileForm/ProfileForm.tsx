"use client";

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../lib/store';
import { setSelectedUser } from '../../lib/slices/appSlice';
import styles from './ProfileForm.module.scss';

export default function ProfileForm() {
  const user = useSelector((state: RootState) => state.app.selectedUser);
  const dispatch = useDispatch<AppDispatch>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [screenName, setScreenName] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.profile?.firstName || '');
      setLastName(user.profile?.lastName || '');
      setScreenName(user.profile?.screenName || '');
      setIndustry(user.profile?.industry || '');
    }
  }, [user]);

  // Make the message disappear after 10 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 10000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          firstName,
          lastName,
          screenName,
          industry,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        dispatch(setSelectedUser(updatedUser));
        setMessage('Profile updated successfully!');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to update profile');
      }
    } catch {
      setMessage('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className={styles.container}>No user selected</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.outerContainer}>
        <h3 className={styles.heading}>Update Profile</h3>
        <div className={styles.innerContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="screenName">Screen Name:</label>
              <input
                type="text"
                id="screenName"
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="industry">Industry:</label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={styles.select}
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button type="submit" disabled={isLoading} className={styles.button}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>

            {message && (
              <div className={`${styles.message} ${message.includes('success') ? styles.success : styles.error}`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 