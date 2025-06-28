// client/src/app/dashboard/layout.tsx
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import WebsiteHeader from '@/components/layout/WebsiteHeader'; // We can reuse the same header

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect runs on the client-side to protect the route
    if (user === null && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  // Don't render anything until authentication status is confirmed
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p> {/* Or a spinner component */}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <WebsiteHeader /> {/* Reusing the main header */}
      <main className="flex-1 bg-muted/40">
        {children}
      </main>
      {/* You could add a different, simpler footer here if you wanted */}
    </div>
  );
}