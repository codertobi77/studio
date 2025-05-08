
"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShoppingCart, Building, UserCog, ShieldCheck, Briefcase, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getProfile } from "@/services/auth";
import type { User } from "@/services/admin"; // Assuming User type for profile
import { Alert, AlertDescription } from "@/components/ui/alert";


// Function to get cookie value by name (if needed, though getProfile handles token internally)
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      // No need to get token here, getProfile service should handle it
      try {
        const profileData = await getProfile();
        setUserProfile(profileData);
      } catch (err) {
        console.error("Failed to fetch profile for dashboard:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load dashboard data.";
        setError(errorMessage);
        // If profile fetch fails, AppLayout might redirect, or we show error here.
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const cardAnimation = "animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <CardTitle>Error Loading Dashboard</CardTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!userProfile) {
    // Should ideally not happen if AppLayout ensures profile or redirects
    return (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <CardTitle>User Profile Not Found</CardTitle>
            <AlertDescription>Could not load user profile. Please try logging in again.</AlertDescription>
        </Alert>
    );
  }

  const isAdmin = userProfile.role === 'admin';
  const isGestionnaire = userProfile.role === 'gestionnaire';
  
  const userDisplayName = `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'User';

  let pageTitle = "Dashboard";
  let pageSubtitle = `Welcome, ${userDisplayName}.`;

  if (isAdmin) {
    pageSubtitle = "Manage platform users and their roles from here.";
  } else if (isGestionnaire) {
    pageTitle = "Manager Dashboard";
    pageSubtitle = "Oversee market operations, listings, and related activities.";
  } else {
     pageSubtitle = "You have access to the platform. Specific dashboard features for your role may be limited or under development.";
  }


  return (
    <div className="space-y-8">
      <div className="space-y-2 animate-in fade-in duration-300">
        <h1 className="text-3xl font-bold tracking-tight text-primary">{pageTitle}</h1>
        <p className="text-muted-foreground">{pageSubtitle}</p>
      </div>

      {isAdmin && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/users/acheteurs" className={`block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg ${cardAnimation} delay-100 fill-mode-backwards`}>
            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden group h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30 group-hover:bg-secondary/50 transition-colors">
                <CardTitle className="text-base font-medium text-secondary-foreground">Acheteurs</CardTitle>
                <ShoppingCart className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent className="p-4 space-y-1 flex-grow">
                <div className="text-2xl font-bold text-primary">Manage Buyers</div>
                <p className="text-xs text-muted-foreground">View, add, edit, and delete buyer accounts.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/users/vendeurs" className={`block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg ${cardAnimation} delay-200 fill-mode-backwards`}>
            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden group h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30 group-hover:bg-secondary/50 transition-colors">
                <CardTitle className="text-base font-medium text-secondary-foreground">Vendeurs</CardTitle>
                <Building className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent className="p-4 space-y-1 flex-grow">
                <div className="text-2xl font-bold text-primary">Manage Sellers</div>
                <p className="text-xs text-muted-foreground">View, add, edit, and delete seller accounts.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/users/gestionnaires" className={`block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg ${cardAnimation} delay-300 fill-mode-backwards`}>
            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden group h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30 group-hover:bg-secondary/50 transition-colors">
                <CardTitle className="text-base font-medium text-secondary-foreground">Gestionnaires</CardTitle>
                <UserCog className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent className="p-4 space-y-1 flex-grow">
                <div className="text-2xl font-bold text-primary">Manage Managers</div>
                <p className="text-xs text-muted-foreground">View, add, edit, and delete manager accounts.</p>
              </CardContent>
            </Card>
          </Link>

           <Link href="/dashboard/users/admins" className={`block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg ${cardAnimation} delay-400 fill-mode-backwards`}>
             <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden group h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30 group-hover:bg-secondary/50 transition-colors">
                <CardTitle className="text-base font-medium text-secondary-foreground">Admins</CardTitle>
                <ShieldCheck className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent className="p-4 space-y-1 flex-grow">
                <div className="text-2xl font-bold text-primary">Manage Admins</div>
                <p className="text-xs text-muted-foreground">View, add, edit, and delete admin accounts.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {isGestionnaire && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/markets" className={`block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg ${cardAnimation} delay-100 fill-mode-backwards`}>
            <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden group h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30 group-hover:bg-secondary/50 transition-colors">
                <CardTitle className="text-base font-medium text-secondary-foreground">Marchés</CardTitle>
                <Briefcase className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent className="p-4 space-y-1 flex-grow">
                <div className="text-2xl font-bold text-primary">Gérer les Marchés</div>
                <p className="text-xs text-muted-foreground">Access and manage market listings and operations.</p>
              </CardContent>
            </Card>
          </Link>
          {/* Add more cards for Gestionnaire as needed */}
        </div>
      )}

      {!isAdmin && !isGestionnaire && (
        <Card className={`${cardAnimation} delay-100 fill-mode-backwards`}>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your dashboard is ready. Specific features for your role will appear here as they become available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
