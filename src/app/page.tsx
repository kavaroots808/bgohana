
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
import { useFirebase } from '@/firebase';
import { Eye, EyeOff } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { logIn, logInAsGuest, isUserLoading, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();

  useEffect(() => {
    // If the initial user check is done and there IS a user, redirect them to the main app.
    if (!isUserLoading && user) {
      router.replace('/tree');
    }
  }, [user, isUserLoading, router]);


  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    
    try {
      await logIn(email, password);
      // The useEffect above will handle the redirect upon successful state change.
      toast({
        title: 'Login Successful',
        description: 'Redirecting to your tree...',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Invalid email or password. Please try again.',
      });
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address to reset your password.',
      });
      return;
    }
    if (!auth) return;

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Password Reset Email Sent',
        description: `An email has been sent to ${email} with instructions to set or reset your password.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Email',
        description: error.message || 'Could not send reset email. Please try again.',
      });
    }
  };


  const handleGuestLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await logInAsGuest();
       toast({
        title: 'Login Successful',
        description: 'You are logged in as a guest.',
      });
       // The useEffect above will handle the redirect.
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Guest Login Failed',
        description: error.message,
      });
      setIsLoggingIn(false);
    }
  };
  
  // While checking for a user, or if a user is found and we are redirecting, show a loading screen.
  if (isUserLoading || user) {
      return (
        <div className="flex flex-col h-screen bg-background items-center justify-center">
            <p>Loading session...</p>
        </div>
      );
  }
  
  // Only show the login page if the loading is complete AND there is no user.
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
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <button onClick={handleForgotPassword} className="ml-auto inline-block text-sm underline">
                        Forgot password?
                    </button>
                </div>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
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
            <Button className="w-full" onClick={handleLogin} disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing In...' : 'Sign In'}
            </Button>
             <div className="relative w-full">
              <Separator className="shrink-0" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">OR</span>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGuestLogin} disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing In...' : 'Sign In as Guest'}
            </Button>
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>
                Don't have an account?{' '}
                <Link href="/signup" className="underline">
                  Sign up
                </Link>
              </p>
              <p>
                Pre-registered?{' '}
                <Link href="/signup/claim" className="underline font-semibold text-primary">
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
    )
}
