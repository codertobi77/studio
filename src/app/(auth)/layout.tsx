import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle"; // Import ThemeToggle
import type { Metadata } from 'next';

// Metadata can remain specific to auth pages if needed, or be more generic
export const metadata: Metadata = {
  title: 'Marketplace Admin - Authentication',
  description: 'Sign in or register for the Marketplace Admin Hub.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ThemeProvider is likely already in the root layout,
    // but wrapping here ensures theme context is available if root layout changes.
    // Keeping it minimal for auth pages.
    <div className="relative min-h-screen bg-background">
       {/* Position ThemeToggle in the top-right corner */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
