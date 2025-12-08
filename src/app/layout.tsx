import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AdminProvider, AdminAuthObserver } from '@/hooks/use-admin';
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
        <AdminProvider>
          <FirebaseClientProvider>
            <AdminAuthObserver />
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </AdminProvider>
      </body>
    </html>
  );
}
