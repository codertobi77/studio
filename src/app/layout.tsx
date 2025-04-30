import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

// Rename the imported variables to avoid conflict if needed, or use directly
// const geistSans = GeistSans; // This is redundant, can use GeistSans directly
// const geistMono = GeistMono; // This is redundant, can use GeistMono directly

export const metadata: Metadata = {
  title: 'Marketplace Admin Hub',
  description: 'Administration dashboard for managing marketplace users: buyers, sellers, managers, and admins.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the font variables directly using the imported font objects */}
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
