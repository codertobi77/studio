"use client";

import * as React from "react";
import {
  Home,
  Users,
  Settings,
  LogOut,
  UserCog,
  Building,
  ShoppingCart,
  ShieldCheck,
  Loader2,
  Menu,
  Briefcase, // Added for Markets link
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
import type { User } from "@/services/admin"; // Assuming User type for profile
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/theme-toggle";

const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = React.useState<User | null>(null); // Use User type
  const [isLoading, setIsLoading] = React.useState(true);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    const fetchProfile = async () => {
      const token = getCookie("authToken");
      if (!token) {
        console.log("No auth token cookie found, redirecting to login.");
        router.push("/login");
        return;
      }

      setIsLoading(true);
      try {
        const profile = await getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({
          title: "Session Error",
          description: "Could not retrieve profile. Please log in again.",
          variant: "destructive",
        });
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
      await logout();
    } catch (error) {
       console.error("API Logout failed (continuing local cleanup):", error);
    } finally {
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
    const names = username.trim().split(" ").filter(Boolean);
    if (names.length === 0) return "??";
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

   if (isLoading) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <span className="ml-3 text-lg text-muted-foreground">Loading Dashboard...</span>
       </div>
     );
   }

  if (!userProfile) {
      return null;
  }

  const isAdmin = userProfile?.role === 'admin';
  const isGestionnaire = userProfile?.role === 'gestionnaire';

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <Sidebar side="left" collapsible={isMobile ? "offcanvas" : "icon"}>
        <SidebarHeader className="border-b border-sidebar-border p-2">
           <Link href="/dashboard" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring rounded-md p-1 -m-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                <h2 className="text-xl font-semibold text-primary group-data-[state=collapsed]:hidden">
                  {isGestionnaire ? "Manager Hub" : "Admin Hub"}
                </h2>
            </Link>
        </SidebarHeader>
        <SidebarContent className="flex-1 p-2">
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Dashboard">
                <Link href="/dashboard">
                  <Home />
                  <span className="group-data-[state=collapsed]:hidden">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {isAdmin && (
              <SidebarGroup>
                <SidebarGroupLabel>User Management</SidebarGroupLabel>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/users/acheteurs')} tooltip="Buyers">
                     <Link href="/dashboard/users/acheteurs">
                      <ShoppingCart />
                      <span className="group-data-[state=collapsed]:hidden">Acheteurs</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/users/vendeurs')} tooltip="Sellers">
                    <Link href="/dashboard/users/vendeurs">
                      <Building />
                      <span className="group-data-[state=collapsed]:hidden">Vendeurs</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/users/gestionnaires')} tooltip="Managers">
                    <Link href="/dashboard/users/gestionnaires">
                      <UserCog />
                      <span className="group-data-[state=collapsed]:hidden">Gestionnaires</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/users/admins')} tooltip="Admins">
                    <Link href="/dashboard/users/admins">
                      <ShieldCheck />
                      <span className="group-data-[state=collapsed]:hidden">Admins</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroup>
            )}

            {isGestionnaire && (
              <SidebarGroup>
                <SidebarGroupLabel>Market Management</SidebarGroupLabel>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/markets')} tooltip="Markets">
                    <Link href="/dashboard/markets">
                      <Briefcase />
                      <span className="group-data-[state=collapsed]:hidden">Marchés</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {/* Add other market-related links here */}
              </SidebarGroup>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter className="p-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center w-full p-2 rounded-md cursor-pointer hover:bg-muted group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:size-10 group-data-[state=collapsed]:p-0 transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
                <Avatar className="h-8 w-8 group-data-[state=collapsed]:h-7 group-data-[state=collapsed]:w-7">
                  <AvatarFallback className="text-xs group-data-[state=collapsed]:text-[10px]">
                    {getUserInitials(userProfile?.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2 flex flex-col items-start overflow-hidden group-data-[state=collapsed]:hidden">
                  <span className="text-sm font-medium truncate max-w-[120px]">{userProfile?.username || "User"}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">{userProfile?.email || "No email"}</span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
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

      <SidebarInset className="flex flex-col bg-background">
         <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
           <SidebarTrigger className="sm:hidden">
                <Menu className="h-5 w-5"/>
           </SidebarTrigger>
           <div className="flex-1">
           </div>
            <div className="flex items-center gap-2">
               <ThemeToggle />
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
             <div className="animate-in fade-in duration-500">
                {children}
            </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}