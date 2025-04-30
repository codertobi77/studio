import type { Metadata } from 'next';
// Removed GeistSans and GeistMono imports as they were causing errors and not explicitly used in className
// import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

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
      {/* Apply basic font-sans class, relying on globals.css for specific font variables */}
      <body
        // className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`} // Removed font variables
        className={`font-sans antialiased`} // Simplified className
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
