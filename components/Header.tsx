'use client';

import { useState, useEffect } from 'react';
import { MoonIcon, SunIcon, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-background text-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="rounded-full bg-primary p-1">
            <Music className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">SongScribe</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
