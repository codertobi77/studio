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
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { register } from "@/services/auth";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role } from "@/services/admin";
import { Loader2, UserPlus } from "lucide-react"; // Used UserPlus icon

const roles: Role[] = ['acheteur', 'vendeur', 'gestionnaire', 'admin'];

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).trim(),
  email: z.string().email({ message: "Invalid email address." }).trim(),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(roles, { required_error: "Please select a role." }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: undefined,
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    try {
      const result = await register(data);
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: result.message || "Please check your email to verify your account.",
        });
        // Redirect to login page with a parameter indicating successful registration
        router.push("/login?registered=true");
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "Could not create account. Please check your input.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again later.";
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4"> {/* Subtle gradient */}
      <Card className="w-full max-w-md shadow-xl border border-border/50 bg-card/95 backdrop-blur-sm rounded-xl"> {/* Enhanced styling */}
        <CardHeader className="space-y-2 text-center p-6">
            <div className="flex justify-center mb-4">
              {/* Placeholder Logo/Icon */}
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                 <UserPlus className="h-8 w-8 text-primary" />
              </div>
           </div>
          <CardTitle className="text-2xl font-bold text-primary">Create Your Account</CardTitle>
          <CardDescription>Join the Marketplace Admin Hub</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="johndoe"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@example.com"
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
                     <FormDescription>
                        Must be at least 6 characters long.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger className="bg-input focus:ring-primary focus:border-primary"> {/* Enhanced focus state */}
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {/* Capitalize role name */}
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base" disabled={isLoading}> {/* Larger button */}
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Account...</> : "Create Account"}
              </Button>
            </form>
          </Form>
          <div className="mt-8 text-center text-sm"> {/* Increased margin */}
             <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-accent hover:text-accent/80 underline underline-offset-4 focus:outline-none focus:ring-1 focus:ring-accent rounded px-0.5">
                  Sign in here
                </Link>
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
