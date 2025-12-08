
'use client';
import { useState } from 'react';
import { useAuth, AuthProvider } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { AppHeader } from '@/components/header';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

function ClaimAccountPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const { claimAccount, isUserLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleClaim = async () => {
    if (isClaiming) return;
    
    if (!name || !email || !password || !confirmPassword || !registrationCode) {
        toast({
            variant: 'destructive',
            title: 'Missing Fields',
            description: 'Please fill out all required fields.',
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
    
    setIsClaiming(true);
    
    try {
      await claimAccount(email, password, name, registrationCode);
      
      toast({ title: 'Account Claimed Successfully!', description: 'You are now logged in and can access your dashboard.' });
      router.push('/tree'); // Redirect to the main dashboard after claiming
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Account Claim Failed',
        description: error.message,
      });
      setIsClaiming(false);
    }
  };
  
  if (isUserLoading) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <AppHeader/>
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Claim Your Account</CardTitle>
            <CardDescription>Enter your pre-registration code and details to activate your account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="registrationCode">Registration Code</Label>
               <div className="relative">
                <Input id="registrationCode" placeholder="Enter your unique code" required value={registrationCode} onChange={(e) => setRegistrationCode(e.target.value)} />
                <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
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
            <Button className="w-full" onClick={handleClaim} disabled={isClaiming}>
              {isClaiming ? 'Claiming Account...' : 'Claim Account & Sign In'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/" className="underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

export default function ClaimAccountPage() {
    return (
        <AuthProvider>
            <ClaimAccountPageContent />
        </AuthProvider>
    )
}
