"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, MailCheck } from "lucide-react"; // Added MailCheck

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { verifyEmail } from "@/services/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email, please wait...");
  const [isRedirecting, setIsRedirecting] = useState(false); // Renamed for clarity

  useEffect(() => {
    const token = searchParams.get("token");

    // Function to handle redirection with delay
    const startRedirect = () => {
        setIsRedirecting(true);
        setMessage(prev => `${prev} Redirecting to login shortly...`); // Append redirect message
        setTimeout(() => {
             router.push('/login');
        }, 4000); // Increased delay to 4 seconds
    };

    // Immediate error if token is missing
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing or invalid.");
      toast({
        title: "Verification Failed",
        description: "No verification token provided in the URL.",
        variant: "destructive",
      });
      startRedirect(); // Start redirect immediately on token error
      return; // Stop further processing
    }

    // Only run verification logic if not already redirecting
    if (!isRedirecting) {
        const handleVerification = async () => {
          try {
            const result = await verifyEmail(token);
            if (result.success) {
              setStatus("success");
              setMessage(result.message || "Email successfully verified!");
              toast({
                title: "Email Verified",
                description: result.message || "Your email has been verified successfully.",
                variant: "default", // Explicitly set to default/success style
              });
            } else {
              setStatus("error");
              setMessage(result.message || "Email verification failed. The link may be expired or invalid.");
              toast({
                title: "Verification Failed",
                description: result.message || "Could not verify email. Please try requesting verification again.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Email verification error:", error);
            setStatus("error");
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during verification.";
            setMessage(`Verification Error: ${errorMessage}`);
            toast({
              title: "Verification Error",
              description: "An unexpected error occurred. Please try again later or contact support.",
              variant: "destructive",
            });
          } finally {
              // Start redirection after verification attempt completes (success or error)
              startRedirect();
          }
        };

        handleVerification();
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, toast]); // Removed isRedirecting from deps to prevent loop, added eslint disable comment

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4"> {/* Consistent gradient */}
      <Card className="w-full max-w-md shadow-xl border border-border/50 bg-card/95 backdrop-blur-sm rounded-xl animate-in fade-in duration-500"> {/* Consistent styling + Animation */}
        <CardHeader className="space-y-2 text-center p-6">
           <div className="flex justify-center mb-4">
              {/* Icon relevant to email verification */}
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                 <MailCheck className="h-8 w-8 text-primary" />
              </div>
           </div>
          <CardTitle className="text-2xl font-bold text-primary">Email Verification</CardTitle>
          <CardDescription>
            {status === "verifying" ? "Processing your request..." : "Verification Status"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-6"> {/* Increased spacing */}
          {/* Verifying State */}
          {status === "verifying" && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}
          {/* Success State */}
          {status === "success" && (
             <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/30 text-left"> {/* Left align text */}
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-1" /> {/* Adjusted icon margin */}
              <AlertTitle className="text-green-700 dark:text-green-300 font-semibold">Verification Successful!</AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-400">
                {message}
              </AlertDescription>
            </Alert>
          )}
          {/* Error State */}
          {status === "error" && (
            <Alert variant="destructive" className="text-left"> {/* Left align text */}
              <XCircle className="h-5 w-5 mt-1" /> {/* Adjusted icon margin */}
              <AlertTitle className="font-semibold">Verification Failed</AlertTitle>
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}
          {/* Manual Redirect Button (fallback) */}
          {(status === 'success' || status === 'error') && !isRedirecting && (
              <Button onClick={() => router.push('/login')} variant="outline" size="sm" className="mt-4">
                  Proceed to Login
              </Button>
          )}
           {/* Redirecting Message */}
           {isRedirecting && (
              <p className="text-sm text-muted-foreground animate-pulse">Redirecting to login...</p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
