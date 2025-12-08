'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component now just redirects to the new home/login page.
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <p>Redirecting to login...</p>
    </div>
  );
}
