
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AdminProvider, AdminAuthObserver } from '@/hooks/use-admin';
import { FirebaseClientProvider } from '@/firebase';
import { AuthProvider } from '@/hooks/use-auth';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/branding';

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AdminProvider>
            <AuthProvider>
              <AdminAuthObserver />
              {children}
            </AuthProvider>
          </AdminProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
