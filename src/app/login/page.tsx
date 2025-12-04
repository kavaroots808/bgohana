
'use client';
import { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { AppHeader } from '@/components/header';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import type { Distributor } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Eye, EyeOff } from 'lucide-react';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { logIn, logInAsGuest, user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'distributors', user.uid);
  }, [firestore, user]);

  const { data: distributor, isLoading: isDistributorLoading } = useDoc<Distributor>(userDocRef);

  // useEffect(() => {
  //   // Wait until both auth and distributor data loading are complete
  //   if (!loading && !isDistributorLoading && user) {
  //       if (distributor) {
  //           // If distributor doc exists, check if they need to select a sponsor
  //           if (distributor.sponsorSelected) {
  //               router.push('/');
  //           } else {
  //               router.push('/onboarding/select-sponsor');
  //           }
  //       } 
  //       // If there's a user but no distributor doc, something is wrong,
  //       // but we can probably send them to sponsor selection as a fallback.
  //       else {
  //            router.push('/onboarding/select-sponsor');
  //       }
  //   }
  // }, [user, loading, distributor, isDistributorLoading, router]);


  const handleLogin = async () => {
    try {
      await logIn(email, password);
      // The useEffect will handle redirection.
      toast({
        title: 'Login Successful',
        description: 'You can now navigate to other pages.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    }
  };

  const handleGuestLogin = async () => {
    try {
      await logInAsGuest();
       // The useEffect will handle redirection.
       toast({
        title: 'Login Successful',
        description: 'You are logged in as a guest.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Guest Login Failed',
        description: error.message,
      });
    }
  };
  
  if (loading || isDistributorLoading) {
      return (
        <div className="flex flex-col h-screen bg-background items-center justify-center">
            <p>Loading...</p>
        </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <AppHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your email below to login to your account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={handleLogin}>
              Sign In
            </Button>
             <div className="relative w-full">
              <Separator className="shrink-0" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">OR</span>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGuestLogin}>
              Sign In as Guest
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

export default function LoginPage() {
    return (
        <AuthProvider>
            <LoginPageContent />
        </AuthProvider>
    )
}
