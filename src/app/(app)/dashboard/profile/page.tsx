
"use client";

import * as React from "react";
import { getProfile } from "@/services/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, Mail, ShieldCheck, CalendarDays, Terminal, PersonStanding } from "lucide-react"; // Used ShieldCheck for role, PersonStanding for Name
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator"; // Import Separator
import type { User as UserProfileType } from "@/services/admin"; // Using the admin User type

// Function to get cookie value by name
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

export default function ProfilePage() {
  const [profile, setProfile] = React.useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      const token = getCookie("authToken");
      if (!token) {
          setError("Authentication token not found. Please log in again.");
          setIsLoading(false);
          // Consider redirecting if necessary, though layout should handle this
          return;
      }

      try {
        const profileData = await getProfile();
        setProfile(profileData);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load profile data. Please try again later.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Improved field rendering with better alignment and spacing
  const renderProfileField = (Icon: React.ElementType, label: string, value: React.ReactNode) => (
    <div className="flex items-start space-x-4 py-3"> {/* Use items-start for better alignment with multiline values */}
      <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" /> {/* Added mt-1 for alignment */}
      <div className="flex-grow">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground break-words">{value || <span className="italic">Not provided</span>}</p> {/* Added italic for missing values */}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary animate-in fade-in duration-300">User Profile</h1>
      <Card className="shadow-md border border-border animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-backwards">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="h-6 w-6 text-primary"/> {/* Slightly larger icon */}
            Profile Information
          </CardTitle>
          <CardDescription>View your personal details below.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border"> {/* Use divider for better separation */}
          {isLoading && (
            <div className="space-y-6 p-4"> {/* Add padding for loading state */}
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          {error && (
            <div className="p-4"> {/* Add padding for error state */}
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Profile</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          {!isLoading && !error && profile && (
            // Remove internal padding, rely on renderProfileField's padding
            <>
              {renderProfileField(PersonStanding, "Full Name", `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || <span className="italic">Not provided</span>)}
              {renderProfileField(Mail, "Email", profile.email)}
              {renderProfileField(ShieldCheck, "Role", <Badge variant="secondary" className="capitalize">{profile.role || 'Unknown'}</Badge>)}
              {profile.createdAt && renderProfileField(CalendarDays, "Joined Date", new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}
              {/* Add more profile fields here as needed */}
            </>
          )}
           {!isLoading && !error && !profile && (
             <p className="text-muted-foreground text-center p-6">No profile data available.</p> // Add padding
           )}
        </CardContent>
         {/* Optional Footer for Actions - commented out */}
         {/*
         <CardFooter className="border-t pt-4 px-6 pb-6"> // Adjusted padding
             <Button variant="outline">Edit Profile</Button>
             // <Button variant="outline" className="ml-2">Change Password</Button>
         </CardFooter>
          */}
      </Card>
    </div>
  );
}

