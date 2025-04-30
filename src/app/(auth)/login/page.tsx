"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/services/auth";
import Link from "next/link";
import { Loader2, Briefcase } from "lucide-react"; // Used Briefcase as a generic business icon

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const result = await login(data);
      // Removed token handling logic as it relies on mock API response structure
      // It will be handled by the actual API call's success path

      if (result.success && result.token) {
         // Use Cookies for middleware compatibility + localStorage for client access
         document.cookie = `authToken=${result.token}; path=/; max-age=86400; SameSite=Lax`; // 1 day expiry, Lax recommended
         localStorage.setItem("authToken", result.token);

        toast({
          title: "Login Successful",
          description: result.message || "Welcome back!",
        });
        // Redirect based on 'redirectedFrom' or default to dashboard
        const redirectedFrom = new URLSearchParams(window.location.search).get('redirectedFrom');
        router.push(redirectedFrom || "/dashboard");
      } else {
        // Clear potentially invalid token if login explicitly fails or no token received
        document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
        localStorage.removeItem("authToken");
        toast({
          title: "Login Failed",
          description: result.message || "Invalid credentials or missing token.",
          variant: "destructive",
        });
      }
    } catch (error) {
       document.cookie = 'authToken=; path=/; max-age=0; SameSite=Lax';
       localStorage.removeItem("authToken");
       console.error("Login error:", error);
       const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
       toast({
         title: "Login Error",
         description: errorMessage,
         variant: "destructive",
       });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4"> {/* Subtle gradient */}
      <Card className="w-full max-w-md shadow-xl border border-border/50 bg-card/95 backdrop-blur-sm rounded-xl animate-in fade-in duration-500"> {/* Enhanced styling + Animation */}
        <CardHeader className="space-y-2 text-center p-6">
           <div className="flex justify-center mb-4">
              {/* Placeholder Logo/Icon */}
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                 <Briefcase className="h-8 w-8 text-primary" />
              </div>
           </div>
          <CardTitle className="text-2xl font-bold text-primary">Marketplace Admin Hub</CardTitle>
          <CardDescription>Sign in to manage your marketplace</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        {...field}
                        disabled={isLoading}
                        className="bg-input focus:ring-primary focus:border-primary" // Enhanced focus state
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                        className="bg-input focus:ring-primary focus:border-primary" // Enhanced focus state
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base" disabled={isLoading}> {/* Larger button */}
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing In...</> : "Sign In"}
              </Button>
            </form>
          </Form>
          <div className="mt-8 text-center text-sm space-y-3"> {/* Increased margin */}
             <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="font-medium text-accent hover:text-accent/80 underline underline-offset-4 focus:outline-none focus:ring-1 focus:ring-accent rounded px-0.5">
                  Register here
                </Link>
             </p>
            <p className="text-muted-foreground">
              Need to verify your email?{" "}
              <Link href="/verify-email" className="font-medium text-accent hover:text-accent/80 underline underline-offset-4 focus:outline-none focus:ring-1 focus:ring-accent rounded px-0.5">
                Verify Email
              </Link>
            </p>
             {/* Optional: Forgot password link */}
             {/*
             <p className="text-muted-foreground">
                <Link href="/forgot-password" className="font-medium text-accent hover:text-accent/80 underline underline-offset-4">
                  Forgot Password?
                </Link>
             </p>
              */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
