"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function IndustryUpdater() {
  const { data: session, status } = useSession();

  useEffect(() => {
    const updateUserIndustry = async () => {
      console.log('IndustryUpdater: Status:', status);
      console.log('IndustryUpdater: Session:', session);
      
      if (status === 'authenticated' && session?.user) {
        console.log('IndustryUpdater: User authenticated, checking for pending industry');
        const pendingIndustry = localStorage.getItem('pendingIndustry');
        console.log('IndustryUpdater: Pending industry:', pendingIndustry);
        
        if (pendingIndustry) {
          try {
            console.log('IndustryUpdater: Calling API to update industry');
            // Call API to update user's industry
            const response = await fetch('/api/user/update-industry', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ industry: pendingIndustry }),
            });

            console.log('IndustryUpdater: API response status:', response.status);
            
            if (response.ok) {
              const result = await response.json();
              console.log('IndustryUpdater: Industry updated successfully:', result);
              localStorage.removeItem('pendingIndustry');
            } else {
              const error = await response.text();
              console.error('IndustryUpdater: Failed to update industry:', error);
            }
          } catch (error) {
            console.error('IndustryUpdater: Error updating industry:', error);
          }
        } else {
          console.log('IndustryUpdater: No pending industry found');
        }
      }
    };

    updateUserIndustry();
  }, [session, status]);

  return null; // This component doesn't render anything
} 