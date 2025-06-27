"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from './ProfileForm.module.scss';

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Entertainment',
  'Food & Beverage',
  'Transportation',
  'Other'
];

export default function ProfileForm() {
  const { data: session } = useSession();
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [otherIndustry, setOtherIndustry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.email) {
      setMessage('Please sign in to update your profile.');
      return;
    }

    const industry = selectedIndustry === 'Other' ? otherIndustry : selectedIndustry;
    
    if (!industry) {
      setMessage('Please select an industry.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ industry }),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setSelectedIndustry('');
        setOtherIndustry('');
      } else {
        const error = await response.text();
        setMessage(`Error: ${error}`);
      }
    } catch {
      setMessage('An error occurred while updating your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.formTitle}>Update Profile</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="industry">Industry</label>
          <select
            id="industry"
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">Select an industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {selectedIndustry === 'Other' && (
          <div className={styles.formGroup}>
            <label htmlFor="otherIndustry">Specify Industry</label>
            <input
              type="text"
              id="otherIndustry"
              value={otherIndustry}
              onChange={(e) => setOtherIndustry(e.target.value)}
              className={styles.input}
              placeholder="Enter your industry"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Updating...' : 'Update Profile'}
        </button>

        {message && (
          <div className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
} 