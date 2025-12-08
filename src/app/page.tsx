
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/header';
import Link from 'next/link';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { AuthProvider } from '@/hooks/use-auth';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { user, isUserLoading, logIn, logInAsGuest } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If auth has loaded and a user is logged in, redirect them away from the login page.
    if (!isUserLoading && user) {
      // The `useAuth` hook handles redirecting to onboarding if needed.
      // Otherwise, go to the main tree view.
      router.replace('/tree');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    
    if (!email || !password) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please enter both your email and password.',
        });
        return;
    }

    setIsLoggingIn(true);
    try {
      await logIn(email, password);
      // Success toast and redirection are handled by the useEffect above.
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Please check your credentials and try again.',
      });
      setIsLoggingIn(false);
    }
  };
  
  const handleGuestLogin = async () => {
    setIsLoggingIn(true);
    try {
      await logInAsGuest();
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Could not log in as guest. Please try again.',
      });
      setIsLoggingIn(false);
    }
  }

  // Show a loading state while checking for an existing session
  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoggingIn}
              />
            </div>
            <div className="grid gap-2">
               <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoggingIn}
                />
                 <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoggingIn}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleLogin} disabled={isLoggingIn} className="w-full">
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </Button>
            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>
            <Button variant="secondary" onClick={handleGuestLogin} disabled={isLoggingIn} className="w-full">
               <LogIn className="mr-2 h-4 w-4" /> Guest Sign In
            </Button>
            <div className='text-center text-sm text-muted-foreground flex flex-col gap-1'>
                 <p>
                    Don't have an account?{' '}
                    <Link href="/signup" className="underline hover:text-primary">
                        Sign up
                    </Link>
                </p>
                 <p>
                    Have a code?{' '}
                    <Link href="/signup/claim" className="underline hover:text-primary">
                        Claim your account
                    </Link>
                </p>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}


export default function HomePage() {
  return (
    <AuthProvider>
      <LoginPageContent />
    </AuthProvider>
  );
}
