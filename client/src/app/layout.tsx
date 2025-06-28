// client/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster as SonnerToaster } from "@/components/ui/sonner"; // <-- ADD THIS

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'File Transfer',
  description: 'Upload and share your files easily',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <SonnerToaster richColors position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}