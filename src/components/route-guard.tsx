
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const PUBLIC_PATHS = ['/login', '/signup'];
const ADMIN_ROOT_UID = 'eFcPNPK048PlHyNqV7cAz57ukvB2';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, distributor, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until the authentication and profile fetching is complete.
    if (loading) {
      return;
    }

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const isSponsorSelectionPath = pathname === '/onboarding/select-sponsor';

    // If there is no user and the path is not public, redirect to login.
    if (!user && !isPublicPath) {
      router.push('/login');
      return;
    }

    // If there is a user...
    if (user) {
      // If on a public page (like /login), redirect to the homepage.
      if (isPublicPath) {
        router.push('/');
        return;
      }
      
      // Handle the special case for the root admin user. They can go anywhere.
      if (user.uid === ADMIN_ROOT_UID) {
        return;
      }

      // If the distributor profile exists but they haven't selected a sponsor,
      // and they are not already on the sponsor selection page, redirect them.
      if (distributor && !distributor.sponsorSelected && !isSponsorSelectionPath) {
        router.push('/onboarding/select-sponsor');
        return;
      }
      
      // If for some reason the user exists but the distributor profile doesn't,
      // send them to select a sponsor to create their profile.
      if (!distributor && !isSponsorSelectionPath) {
        router.push('/onboarding/select-sponsor');
        return;
      }
    }
  }, [user, distributor, loading, router, pathname]);

  // If loading, or if the user is on a public path, show a simple loading state
  // to avoid flashing content before a redirect can happen.
  if (loading || (!user && !PUBLIC_PATHS.includes(pathname))) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
