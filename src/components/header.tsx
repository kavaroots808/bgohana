'use client';

import { Cog, Waves } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function AppHeader() {
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAdminAccess = () => {
    if (password === '000') {
      setIsOpen(false);
      setPassword('');
      router.push('/admin');
    } else {
      toast({
        variant: 'destructive',
        title: 'Incorrect Password',
        description: 'Please try again.',
      });
      setPassword('');
    }
  };

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card border-b shadow-sm shrink-0">
      <Link href="/" className="flex items-center justify-center" prefetch={false}>
        <Waves className="h-6 w-6 text-primary" />
        <span className="ml-2 text-xl font-bold">BG OHANA TREE</span>
      </Link>
      <div className="ml-auto">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Admin Backend">
              <Cog className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Admin Access</DialogTitle>
              <DialogDescription>
                Enter the password to access the admin backend.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAdminAccess();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdminAccess}>Enter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
