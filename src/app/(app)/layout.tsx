"use client";

import * as React from "react";
import {
  Home,
  Users,
  Settings, // Keep Settings for Profile link
  LogOut,
  UserCog, // Gestionnaires
  Building, // Vendeurs
  ShoppingCart, // Acheteurs
  ShieldCheck, // Admins (using a different icon)
  Loader2, // Loading state
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logout, getProfile } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Function to get cookie value by name
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined; // Guard for SSR
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Use usePathname hook
  const { toast } = useToast();
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      // Check cookie first, as it's needed for middleware
      const token = getCookie("authToken");
      if (!token) {
        console.log("No auth token cookie found, redirecting to login.");
        router.push("/login"); // Redirect if no token
        return;
      }

      try {
        // Assume getProfile uses the token implicitly (e.g., via headers in API calls)
        const profile = await getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({
          title: "Authentication Error",
          description: "Session invalid or expired. Please log in again.",
          variant: "destructive",
        });
        // Clear token cookie and localStorage
        document.cookie = 'authToken=; path=/; max-age=0';
        localStorage.removeItem("authToken");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router, toast]);

  const handleLogout = async () => {
    try {
      await logout(); // Call the API logout endpoint if it exists
    } catch (error) {
       console.error("API Logout failed (continuing local cleanup):", error);
       // Continue with local cleanup even if API call fails
    } finally {
       // Clear token cookie and localStorage
       document.cookie = 'authToken=; path=/; max-age=0';
       localStorage.removeItem("authToken");
       toast({
         title: "Logged Out",
         description: "You have been successfully logged out.",
       });
       router.push("/login");
    }
  };

  const getUserInitials = (username: string | undefined): string => {
    if (!username) return "??";
    const names = username.trim().split(" ");
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  // Render loading state centered on the screen
   if (isLoading) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <span className="ml-3 text-lg text-muted-foreground">Loading Dashboard...</span>
       </div>
     );
   }

  // Render null if profile fetch failed and redirection is happening
  if (!userProfile) {
      return null;
  }

  return (
    <SidebarProvider defaultOpen={true}> {/* Keep sidebar open by default on desktop */}
      <Sidebar side="left" collapsible="icon"> {/* Use icon collapse */}
        <SidebarHeader className="border-b border-sidebar-border">
           <Link href="/dashboard" className="flex items-center gap-2">
                {/* Placeholder for a logo if needed */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                <h2 className="text-xl font-semibold text-primary group-data-[collapsed=true]:hidden">Admin Hub</h2>
            </Link>
        </SidebarHeader>
        <SidebarContent className="p-2"> {/* Add padding to content */}
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Dashboard">
                <Link href="/dashboard">
                  <Home />
                  <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarGroup>
              <SidebarGroupLabel>User Management</SidebarGroupLabel>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/users/acheteurs'} tooltip="Buyers">
                   <Link href="/dashboard/users/acheteurs">
                    <ShoppingCart />
                    <span className="group-data-[collapsible=icon]:hidden">Acheteurs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/users/vendeurs'} tooltip="Sellers">
                  <Link href="/dashboard/users/vendeurs">
                    <Building />
                    <span className="group-data-[collapsible=icon]:hidden">Vendeurs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/users/gestionnaires'} tooltip="Managers">
                  <Link href="/dashboard/users/gestionnaires">
                    <UserCog />
                    <span className="group-data-[collapsible=icon]:hidden">Gestionnaires</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/dashboard/users/admins'} tooltip="Admins">
                  <Link href="/dashboard/users/admins">
                    <ShieldCheck /> {/* Changed icon for Admins */}
                    <span className="group-data-[collapsible=icon]:hidden">Admins</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroup>

          </SidebarMenu>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter className="p-2"> {/* Add padding to footer */}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-start w-full p-2 h-auto text-left group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0">
                <Avatar className="h-8 w-8 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6">
                  {/* Add AvatarImage if profile picture URL is available */}
                  {/* <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.username} /> */}
                  <AvatarFallback className="text-xs group-data-[collapsible=icon]:text-[10px]">
                    {getUserInitials(userProfile?.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2 flex flex-col items-start group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-medium truncate max-w-[100px]">{userProfile?.username || "User"}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">{userProfile?.email || ""}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start" forceMount> {/* Adjusted side and alignment */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">{userProfile?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {userProfile?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background"> {/* Ensure inset uses background color */}
        {/* Header within the main content area */}
         <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
           {/* Hamburger menu trigger for mobile, hidden on desktop */}
           <SidebarTrigger className="sm:hidden" />
            {/* Optional Breadcrumbs or Page Title can go here */}
            {/* Example: <h1 className="text-lg font-semibold text-primary">Page Title</h1> */}
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6"> {/* Ensure main content is scrollable */}
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
