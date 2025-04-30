"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react"; // Added CheckCircle, XCircle

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
import { Button } from "@/components/ui/button"; // Import Button

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your email...");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    const redirectToLogin = () => {
        setRedirecting(true);
        setTimeout(() => router.push('/login'), 3000);
    };

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing or invalid.");
      toast({
        title: "Verification Failed",
        description: "No verification token provided in the URL.",
        variant: "destructive",
      });
      redirectToLogin();
      return;
    }

    const handleVerification = async () => {
      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Email successfully verified!");
          toast({
            title: "Email Verified",
            description: result.message || "Your email has been verified.",
          });
        } else {
          setStatus("error");
          setMessage(result.message || "Email verification failed. The link may be expired or invalid.");
          toast({
            title: "Verification Failed",
            description: result.message || "Could not verify email.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during verification.";
        setMessage(errorMessage);
        toast({
          title: "Verification Error",
          description: "Please try again later or contact support.",
          variant: "destructive",
        });
      } finally {
          // Always redirect after attempting verification
          redirectToLogin();
      }
    };

    // Prevent multiple calls if redirecting
    if (!redirecting) {
        handleVerification();
    }

  }, [searchParams, router, toast, redirecting]); // Added redirecting to dependency array

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border border-border"> {/* Added border */}
        <CardHeader className="space-y-2 text-center"> {/* Increased spacing */}
          <CardTitle className="text-2xl font-bold text-primary">Email Verification</CardTitle>
          <CardDescription>
            {status === "verifying" ? "Processing your email verification..." : "Verification Status"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4"> {/* Added spacing */}
          {status === "verifying" && (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">{message}</p>
            </div>
          )}
          {status === "success" && (
             <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/30">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" /> {/* Icon */}
              <AlertTitle className="text-green-700 dark:text-green-300">Success!</AlertTitle>
              <AlertDescription className="text-green-600 dark:text-green-400">
                {message} {redirecting && "Redirecting to login..."}
              </AlertDescription>
            </Alert>
          )}
          {status === "error" && (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" /> {/* Icon */}
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {message} {redirecting && "Redirecting to login..."}
              </AlertDescription>
            </Alert>
          )}
          {/* Optionally show a button to redirect manually if auto-redirect fails */}
          {(status === 'success' || status === 'error') && !redirecting && (
              <Button onClick={() => router.push('/login')} variant="outline">
                  Go to Login
              </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
