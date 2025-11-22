'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Github } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { TokenSettings } from '@/components/features/auth/TokenSettings';

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${basePath}/logo.png`}
              alt="Contrib.fyi"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            Contrib.fyi
          </Link>
          <nav className="flex gap-6">
            <Link
              href="/picks"
              className={`hover:text-primary text-sm font-medium transition-colors ${
                pathname === '/picks'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              My Picks
            </Link>
            <Link
              href="/history"
              className={`hover:text-primary text-sm font-medium transition-colors ${
                pathname === '/history'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Recently Viewed
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <TokenSettings />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <a
              href="https://github.com/contrib-fyi/contrib-fyi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
