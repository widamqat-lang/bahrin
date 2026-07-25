import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function checkAdminAccess() {
      setIsChecking(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      try {
        // Verify token against API
        const response = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthorized(data.valid);
        } else {
          // Token invalid or expired
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_email');
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error verifying admin:', error);
        setIsAuthorized(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkAdminAccess();
  }, []);

  if (isChecking) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthorized === false) {
    // Redirect to login page
    setLocation('/admin/login');
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
