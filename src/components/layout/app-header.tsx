import { Utensils } from 'lucide-react';
import Link from 'next/link';

export default function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Utensils size={32} />
          <h1 className="text-2xl font-headline tracking-tight">MySmart Menu</h1>
        </Link>
        {/* Placeholder for potential navigation items */}
      </div>
    </header>
  );
}
