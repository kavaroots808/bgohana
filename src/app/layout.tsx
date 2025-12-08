import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AdminProvider, AdminAuthObserver } from '@/hooks/use-admin';
import { AuthProvider } from '@/hooks/use-auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'BG Ohana Tree',
  description: 'Network Marketing Genealogy Tracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="main-bg">
        <FirebaseClientProvider>
          <AdminProvider>
            <AuthProvider>
              <AdminAuthObserver />
              {children}
              <Toaster />
            </AuthProvider>
          </AdminProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
