"use client"; // Or keep as Server Component if no client-side interactions initially

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase, AlertTriangle, Loader2 } from "lucide-react";
import { getProfile } from "@/services/auth";
import type { User } from "@/services/admin";
import { Alert, AlertDescription as UiAlertDescription } from "@/components/ui/alert"; // Renamed to avoid conflict
import { useRouter } from "next/navigation";

export default function MarketsPage() {
  const [userProfile, setUserProfile] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const fetchProfileAndCheckRole = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const profile = await getProfile();
        setUserProfile(profile);
        if (profile?.role !== 'gestionnaire') {
          setError("Access Denied: You do not have permission to view this page.");
          // Optional: redirect after a delay or show a button to go back
          // setTimeout(() => router.push('/dashboard'), 3000);
        }
      } catch (err) {
        console.error("Failed to fetch profile for markets page:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load user data.";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndCheckRole();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg">Loading Market Management...</p>
      </div>
    );
  }

  if (error || userProfile?.role !== 'gestionnaire') {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <CardTitle>Access Denied</CardTitle>
            <UiAlertDescription>
              {error || "You do not have the necessary permissions to access this page."}
              Please contact an administrator if you believe this is an error.
            </UiAlertDescription>
          </Alert>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Go to Dashboard
          </Button>
      </div>
    );
  }
  
  // Only render if gestionnaire
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Gestion des Marchés</h1>
        <p className="text-muted-foreground">Gérez les marchés, les offres et les contrats depuis cette interface.</p>
      </div>
      
      <Card className="shadow-lg border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Briefcase className="h-6 w-6 text-primary"/>
            Vue d'ensemble des Marchés
          </CardTitle>
          <CardDescription>
            Consultez, ajoutez, modifiez ou supprimez des marchés. Cette section est en cours de développement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-card/50">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-primary/50" />
            <p className="text-lg font-medium">La fonctionnalité de gestion des marchés est en construction.</p>
            <p className="text-sm">Revenez bientôt pour découvrir les outils de gestion des marchés.</p>
            {/* Placeholder for future market list, creation tools, filters, etc. */}
          </div>
        </CardContent>
      </Card>

      {/* Example of how other sections might look */}
      {/*
      <Card className="shadow-md border border-border">
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
                <Activity className="h-6 w-6 text-primary" />
                Activité Récente sur les Marchés
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Aucune activité récente à afficher.</p>
        </CardContent>
      </Card>
      */}
    </div>
  );
}

// Temporary Button component if not already globally available or for specific styling
const Button = ({ children, onClick, variant = "default", className = "" }: { children: React.ReactNode, onClick?: () => void, variant?: string, className?: string }) => (
    <button 
        onClick={onClick} 
        className={`px-4 py-2 rounded-md font-medium transition-colors
            ${variant === "outline" ? "border border-border hover:bg-muted" : "bg-primary text-primary-foreground hover:bg-primary/90"}
            ${className}`}
    >
        {children}
    </button>
);