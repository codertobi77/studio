"use client";

import * as React from "react";
import { getProfile } from "@/services/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, Mail, ShieldQuestion, CalendarDays, Terminal } from "lucide-react"; // Added more specific icons
import { Button } from "@/components/ui/button"; // For potential actions
import { Badge } from "@/components/ui/badge"; // To display role

// Function to get cookie value by name
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined; // Guard for SSR
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

export default function ProfilePage() {
  const [profile, setProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      const token = getCookie("authToken"); // Check for token existence
      if (!token) {
          setError("Authentication token not found. Please log in again.");
          setIsLoading(false);
          // Consider redirecting here if needed
          return;
      }

      try {
        const profileData = await getProfile(); // Assumes getProfile handles token internally or via headers
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

  const renderProfileField = (Icon: React.ElementType, label: string, value: React.ReactNode) => (
    <div className="flex items-center space-x-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto"> {/* Centered content */}
      <h1 className="text-3xl font-bold text-primary">User Profile</h1>
      <Card className="shadow-md border border-border"> {/* Added border */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"> {/* Adjusted size */}
            <User className="h-5 w-5 text-primary"/>
            Profile Information
          </CardTitle>
          <CardDescription>View your personal details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6"> {/* Increased spacing */}
          {isLoading && (
            <div className="space-y-4">
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
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" /> {/* Icon */}
              <AlertTitle>Error Loading Profile</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && profile && (
            <div className="space-y-4">
              {renderProfileField(User, "Username", profile.username)}
              {renderProfileField(Mail, "Email", profile.email)}
              {/* Assuming role and createdAt are available in profile object */}
              {renderProfileField(ShieldQuestion, "Role", <Badge variant="secondary">{profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Unknown'}</Badge>)}
              {profile.createdAt && renderProfileField(CalendarDays, "Joined Date", new Date(profile.createdAt).toLocaleDateString())}
              {/* Add more profile fields here as needed */}
              {/* Example: renderProfileField(Phone, "Phone Number", profile.phoneNumber) */}
            </div>
          )}
           {!isLoading && !error && !profile && (
             <p className="text-muted-foreground text-center">No profile data available.</p>
           )}
        </CardContent>
         {/* Optional Footer for Actions */}
         {/*
         <CardFooter className="border-t pt-4">
             <Button variant="outline">Edit Profile</Button>
              // Add other actions like 'Change Password'
         </CardFooter>
          */}
      </Card>
    </div>
  );
}
