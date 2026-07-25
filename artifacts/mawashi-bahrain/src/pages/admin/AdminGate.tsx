import { useUser } from '@clerk/react';

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
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

  return <>{children}</>;
}
