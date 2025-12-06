
'use client';

import * as React from 'react';
import { Library, LogOut, ShieldOff, UserCog, Users, LayoutDashboard, Menu, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import { AppSidebar } from './app-sidebar';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

function NavLink({ href, children, closeSheet }: { href: string, children: React.ReactNode, closeSheet?: () => void }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    const content = (
        <span className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            isActive && "bg-muted text-primary"
        )}>
            {children}
        </span>
    );
    
    if (closeSheet) {
        return <SheetClose asChild><Link href={href}>{content}</Link></SheetClose>
    }

    return <Link href={href}>{content}</Link>;
}


export function AppHeader() {
  const { user, logOut } = useAuth();
  const { isAdmin, disableAdminMode } = useAdmin();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleLogout = async () => {
    await logOut();
    setIsSheetOpen(false);
    router.push('/login');
  };
  
  const isRootUser = user?.uid === 'eFcPNPK048PlHyNqV7cAz57ukvB2';

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card border-b shadow-sm shrink-0 z-50 relative">
      <div className="flex items-center gap-2">
        <div className="lg:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                         <Image src="/bg_ohana_logo.jpg" alt="BG Ohana Tree Logo" width={30} height={30} className="h-8 w-auto" />
                        <span className="text-lg font-bold">BG OHANA TREE</span>
                    </div>
                    <nav className="grid gap-2 text-lg font-medium">
                        <NavLink href="/" closeSheet={() => setIsSheetOpen(false)}><Home className="h-5 w-5" /> Home</NavLink>
                        <NavLink href="/distributors" closeSheet={() => setIsSheetOpen(false)}><Users className="h-5 w-5" /> Distributors</NavLink>
                        <NavLink href="/library" closeSheet={() => setIsSheetOpen(false)}><Library className="h-5 w-5" /> Library</NavLink>
                         {user && (
                            <NavLink href={`/dashboard/${user.uid}`} closeSheet={() => setIsSheetOpen(false)}>
                                <LayoutDashboard className="h-5 w-5" /> Dashboard
                            </NavLink>
                         )}
                    </nav>
                     <Separator className="my-4" />
                    <div className="mt-auto flex flex-col gap-2">
                        {isAdmin && !isRootUser && (
                            <>
                                <NavLink href="/admin" closeSheet={() => setIsSheetOpen(false)}>
                                    <UserCog className="h-5 w-5" /> Admin
                                </NavLink>
                                <Button variant="outline" size="sm" onClick={() => { disableAdminMode(); setIsSheetOpen(false); }}>
                                    <ShieldOff className="mr-2 h-4 w-4" /> Exit Admin
                                </Button>
                            </>
                        )}
                        {isRootUser && (
                            <NavLink href="/admin" closeSheet={() => setIsSheetOpen(false)}>
                                <UserCog className="h-5 w-5" /> Admin
                            </NavLink>
                        )}
                         {user && (
                            <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                                <LogOut className="mr-3 h-5 w-5" /> Logout
                            </Button>
                         )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
        <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
            <Image src="/bg_ohana_logo.jpg" alt="BG Ohana Tree Logo" width={30} height={30} className="h-8 w-auto" />
            <span className="hidden md:inline-block text-lg md:text-xl font-bold">BG OHANA TREE</span>
        </Link>
      </div>

      <nav className="ml-auto hidden lg:flex items-center gap-2">
         <Button variant="ghost" asChild>
            <Link href="/distributors">
                <Users className="mr-2 h-4 w-4" />
                Distributors
            </Link>
        </Button>
         <Button variant="ghost" asChild>
            <Link href="/library">
                <Library className="mr-2 h-4 w-4" />
                Library
            </Link>
        </Button>
        {user && (
            <Button variant="ghost" asChild>
                <Link href={`/dashboard/${user.uid}`}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                </Link>
            </Button>
        )}
      </nav>
      
      <div className='hidden lg:flex items-center gap-2 ml-4'>
        {user ? (
          <>
            {isAdmin && (
                 <Button variant="outline" size="sm" asChild>
                  <Link href="/admin">
                    <UserCog className="mr-2 h-4 w-4" /> Admin
                  </Link>
                </Button>
            )}
            {isAdmin && !isRootUser && (
                <Button variant="outline" size="sm" onClick={disableAdminMode}>
                  <ShieldOff className="mr-2 h-4 w-4" /> Exit Admin
                </Button>
            )}
            <Button variant="ghost" size="icon" aria-label="Log Out" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : (
            <Button asChild>
                <Link href="/login">Login</Link>
            </Button>
        )}
      </div>
    </header>
  );
}
