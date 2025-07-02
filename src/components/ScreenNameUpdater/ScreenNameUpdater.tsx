"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ScreenNameUpdater() {
  const { data: session } = useSession();

  useEffect(() => {
    const updateScreenName = async () => {
      if (!session?.user?.email) return;

      const pendingScreenName = localStorage.getItem('pendingScreenName');
      if (!pendingScreenName) return;

      console.log('ScreenNameUpdater: Found pending screen name:', pendingScreenName);

      try {
        const response = await fetch('/api/user/update-screen-name', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ screenName: pendingScreenName }),
        });

        if (response.ok) {
          console.log('ScreenNameUpdater: Screen name updated successfully');
          localStorage.removeItem('pendingScreenName');
        } else {
          console.error('ScreenNameUpdater: Failed to update screen name');
        }
      } catch (error) {
        console.error('ScreenNameUpdater: Error updating screen name:', error);
      }
    };

    updateScreenName();
  }, [session]);

  return null;
} 