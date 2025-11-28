import { Cog, Waves } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export function AppHeader() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-card border-b shadow-sm shrink-0">
      <Link href="/" className="flex items-center justify-center" prefetch={false}>
        <Waves className="h-6 w-6 text-primary" />
        <span className="ml-2 text-xl font-bold">NetworkWeave</span>
      </Link>
      <div className="ml-auto">
        <Link href="/admin">
          <Button variant="outline" size="icon" aria-label="Admin Backend">
            <Cog className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
