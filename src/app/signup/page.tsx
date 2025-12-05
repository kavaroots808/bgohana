
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
import { AppHeader } from '@/components/header';
import { Eye, EyeOff } from 'lucide-react';

function SignupPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [signupInitiated, setSignupInitiated] = useState(false);

  useEffect(() => {
    if (!loading && user && signupInitiated) {
      // If user is now logged in AND the signup process was just completed, push to onboarding.
      router.push('/onboarding/select-sponsor');
    }
  }, [user, loading, router, signupInitiated]);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
        toast({
            variant: 'destructive',
            title: 'Missing Fields',
            description: 'Please fill out all fields to sign up.',
        });
        return;
    }
    if (password !== confirmPassword) {
        toast({
            variant: 'destructive',
            title: 'Passwords do not match',
            description: 'Please re-enter your password and confirm it.',
        });
        return;
    }
    try {
      setSignupInitiated(true);
      await signUp(email, password, name);
      // The useEffect will handle redirection after successful signup.
    } catch (error: any) {
      setSignupInitiated(false); // Reset on failure
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.code === 'auth/email-already-in-use' 
            ? 'This email is already in use. Please log in.'
            : error.message,
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  // If a user is already logged in and didn't just sign up, redirect them away
  if (user && !signupInitiated) {
    router.push('/');
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center">
        <p>Redirecting...</p>
      </div>
    )
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
       <AppHeader/>
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>Enter your information to create an account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Jane Doe" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
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
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
               <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={handleSignup}>
              Create Account
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

export default function SignupPage() {
    return (
        <AuthProvider>
            <SignupPageContent />
        </AuthProvider>
    )
}
