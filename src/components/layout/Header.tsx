import Link from 'next/link';
import { Command } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Command className="h-6 w-6 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">
            Pilot Command
          </span>
        </Link>
        <nav className="ml-auto flex items-center space-x-6">
          <Link
            href="/sentiment"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
          >
            Sentiment
          </Link>
          <Link
            href="/settings"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
          >
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}

