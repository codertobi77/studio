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
import { Loader2 } from "lucide-react"; // Import Loader2

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Changed min to 1 as 6 might be too restrictive for login
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
      // Store token regardless of success to attempt profile fetch in layout
      if (result.token) {
        // Use Cookies for middleware compatibility
        document.cookie = `authToken=${result.token}; path=/; max-age=86400`; // Example: 1 day expiry
        // Also keep in localStorage for client-side access if needed, but middleware relies on cookie
        localStorage.setItem("authToken", result.token);
      }

      if (result.success) {
        toast({
          title: "Login Successful",
          description: result.message,
        });
        router.push("/dashboard"); // Redirect to dashboard after successful login
      } else {
        // Clear potentially invalid token if login explicitly fails
        document.cookie = 'authToken=; path=/; max-age=0';
        localStorage.removeItem("authToken");
        toast({
          title: "Login Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
       // Clear potentially invalid token on error
       document.cookie = 'authToken=; path=/; max-age=0';
       localStorage.removeItem("authToken");
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again later.";
      toast({
        title: "An error occurred",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border border-border"> {/* Added border */}
        <CardHeader className="space-y-2 text-center"> {/* Increased spacing */}
          <CardTitle className="text-2xl font-bold text-primary">Marketplace Admin Hub</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> {/* Increased spacing */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        {...field}
                        disabled={isLoading}
                        className="bg-input" // Explicitly set background
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
                        className="bg-input" // Explicitly set background
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : "Login"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm space-y-2"> {/* Increased margin and added spacing */}
             <p>
                Don't have an account?{" "}
                <Link href="/register" className="font-medium text-accent hover:text-accent/80 underline underline-offset-4">
                  Register
                </Link>
             </p>
            <p>
              Need to verify your email?{" "}
              <Link href="/verify-email" className="font-medium text-accent hover:text-accent/80 underline underline-offset-4">
                Verify Email
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
