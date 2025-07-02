"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useIsAuthorized } from '../lib/hooks';

interface WithAuthProps {
  requiredRole?: string;
  children: React.ReactNode;
}

export default function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole: string = 'admin'
) {
  return function AuthenticatedComponent(props: P) {
    const { data: session, status } = useSession();
    const isAuthorized = useIsAuthorized(requiredRole);
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return; // Still loading
      
      if (status === 'unauthenticated') {
        router.push('/'); // Redirect to home if not logged in
        return;
      }
      
      if (status === 'authenticated' && !isAuthorized) {
        router.push('/'); // Redirect to home if not authorized
        return;
      }
    }, [status, isAuthorized, router]);

    // Show loading while checking auth
    if (status === 'loading') {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem'
        }}>
          Loading...
        </div>
      );
    }

    // Don't render if not authenticated or not authorized
    if (status === 'unauthenticated' || !isAuthorized) {
      return null;
    }

    // Render the protected component
    return <WrappedComponent {...props} />;
  };
} 