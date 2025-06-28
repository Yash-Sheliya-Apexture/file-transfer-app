"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, User, LogOut, UploadCloud, History } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WebsiteHeader() {
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/'); // Redirect to home after logout
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <UploadCloud className="h-6 w-6" />
            <span className="font-bold">File Transfer</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-4 justify-end">
          {isAuthenticated ? (
            <>
              <span className="text-sm font-medium hidden sm:inline-block">Welcome, {user?.name}!</span>
              <Button variant="ghost" asChild>
                <Link href="/dashboard/history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Link>
              </Button>
              <Button onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">
                  <User className="h-4 w-4 mr-2" />
                  Register
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}