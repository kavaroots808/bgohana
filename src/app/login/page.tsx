
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
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPreRegistered, setIsPreRegistered] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { logIn, logInAsGuest, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsPreRegistered(false);
    setIsLoggingIn(true);
    
    try {
      await logIn(email, password);
      toast({
        title: 'Login Successful',
        description: 'Redirecting...',
      });
      // On successful login, explicitly redirect.
      router.push('/');
    } catch (error: any) {
       if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            if (firestore) {
                const q = query(collection(firestore, 'distributors'), where("email", "==", email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    setIsPreRegistered(true);
                    setIsLoggingIn(false);
                    return; // Stop further error handling
                }
            }
        }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
      });
      setIsLoggingIn(false);
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
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Guest Login Failed',
        description: error.message,
      });
      setIsLoggingIn(false);
    }
  };
  
  // Show a loading state while auth status is being determined
  if (loading) {
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
             {isPreRegistered && (
                <Alert variant="default" className="border-primary/50 bg-primary/5">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary">Complete Your Registration</AlertTitle>
                    <AlertDescription>
                        It looks like you've been registered. Please go to the{' '}
                        <Link href="/signup" className="font-bold underline">Sign Up</Link>{' '}
                        page to create your password and access your account.
                    </AlertDescription>
                </Alert>
            )}
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
