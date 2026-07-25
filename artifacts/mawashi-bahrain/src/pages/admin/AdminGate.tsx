import { useState, useEffect } from 'react';
import { useUser } from '@clerk/react';

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    async function checkAdminAccess() {
      if (!isSignedIn || !user) {
        setIsAuthorized(false);
        return;
      }

      setIsChecking(true);
      try {
        // Get user's email from Clerk
        const userEmail = user.primaryEmailAddress?.emailAddress;
        
        if (!userEmail) {
          setIsAuthorized(false);
          return;
        }

        // Verify credentials against database
        const response = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthorized(data.valid);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error verifying admin:', error);
        setIsAuthorized(false);
      } finally {
        setIsChecking(false);
      }
    }

    if (isSignedIn && user) {
      checkAdminAccess();
    }
  }, [isSignedIn, user]);

  if (!isLoaded || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isSignedIn) {
    window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="size-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m15 9-6 6"></path>
            <path d="m9 9 6 6"></path>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-foreground">ليس لديك صلاحية</h1>
        <p className="text-muted-foreground">للوصول إلى لوحة التحكم</p>
        <a 
          href="/" 
          className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          العودة للمتجر
        </a>
      </div>
    );
  }

  // Show loading while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
