'use client';

import { Cog, Library, LogOut, ShieldOff, UserCog, Users, LayoutDashboard, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { AppSidebar } from './app-sidebar';

export function AppHeader() {
  const { user, logOut } = useAuth();
  const { isAdmin, disableAdminMode } = useAdmin();
  const router = useRouter();

  const handleLogout = async () => {
    await logOut();
    // No need to call disableAdminMode() here, as the AdminProvider's state
    // will be reset on logout and re-evaluation.
    router.push('/login');
  };
  
  const isRootUser = user?.uid === 'eFcPNPK048PlHyNqV7cAz57ukvB2';

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card border-b shadow-sm shrink-0 z-50 relative">
      <div className="lg:hidden">
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
                <AppSidebar />
            </SheetContent>
        </Sheet>
      </div>
      <Link href="/" className="flex items-center justify-center" prefetch={false}>
        <Image src="/bg_ohana_logo.jpg" alt="BG Ohana Tree Logo" width={30} height={30} className="h-8 w-auto" />
        <span className="ml-2 text-lg md:text-xl font-bold">BG OHANA TREE</span>
      </Link>
      <nav className="ml-auto flex items-center gap-2 sm:gap-4">
         <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/distributors">
                <Users className="mr-2 h-4 w-4" />
                Distributors
            </Link>
        </Button>
         <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/library">
                <Library className="mr-2 h-4 w-4" />
                Library
            </Link>
        </Button>
        {user ? (
          <>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href={`/dashboard/${user.uid}`}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                </Link>
            </Button>
            {isAdmin ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin">
                    <UserCog className="mr-2 h-4 w-4" /> <span className="hidden md:inline">Admin</span>
                  </Link>
                </Button>
                {/* Do not show the exit button for the root user */}
                {!isRootUser && (
                  <Button variant="outline" size="sm" onClick={disableAdminMode}>
                    <ShieldOff className="mr-2 h-4 w-4" /> <span className="hidden md:inline">Exit Admin</span>
                  </Button>
                )}
              </>
            ) : null}
            <Button variant="ghost" size="icon" aria-label="Log Out" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : null}
      </nav>
    </header>
  );
}
