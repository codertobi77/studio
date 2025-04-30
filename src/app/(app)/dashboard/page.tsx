import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShoppingCart, Building, UserCog, ShieldCheck } from "lucide-react"; // Changed icon for Admins
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8"> {/* Increased spacing */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1> {/* Use Primary color */}
        <p className="text-muted-foreground">Welcome to the Marketplace Admin Hub. Manage users by role below.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"> {/* Increased gap */}
        <Link href="/dashboard/users/acheteurs">
          <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden"> {/* Added explicit styles */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30"> {/* Added background, padding */}
              <CardTitle className="text-base font-medium text-secondary-foreground">Acheteurs</CardTitle> {/* Adjusted size */}
              <ShoppingCart className="h-5 w-5 text-accent" /> {/* Use Accent color, increased size */}
            </CardHeader>
            <CardContent className="p-4"> {/* Adjusted padding */}
              <div className="text-2xl font-bold text-primary">Manage Buyers</div> {/* Use Primary color */}
              <p className="text-xs text-muted-foreground mt-1">View, add, edit, and delete buyer accounts.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/users/vendeurs">
           <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden"> {/* Added explicit styles */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30"> {/* Added background, padding */}
              <CardTitle className="text-base font-medium text-secondary-foreground">Vendeurs</CardTitle> {/* Adjusted size */}
              <Building className="h-5 w-5 text-accent" /> {/* Use Accent color, increased size */}
            </CardHeader>
            <CardContent className="p-4"> {/* Adjusted padding */}
              <div className="text-2xl font-bold text-primary">Manage Sellers</div> {/* Use Primary color */}
              <p className="text-xs text-muted-foreground mt-1">View, add, edit, and delete seller accounts.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/users/gestionnaires">
           <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden"> {/* Added explicit styles */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30"> {/* Added background, padding */}
              <CardTitle className="text-base font-medium text-secondary-foreground">Gestionnaires</CardTitle> {/* Adjusted size */}
              <UserCog className="h-5 w-5 text-accent" /> {/* Use Accent color, increased size */}
            </CardHeader>
            <CardContent className="p-4"> {/* Adjusted padding */}
              <div className="text-2xl font-bold text-primary">Manage Managers</div> {/* Use Primary color */}
              <p className="text-xs text-muted-foreground mt-1">View, add, edit, and delete manager accounts.</p>
            </CardContent>
          </Card>
        </Link>

         <Link href="/dashboard/users/admins">
           <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden"> {/* Added explicit styles */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30"> {/* Added background, padding */}
              <CardTitle className="text-base font-medium text-secondary-foreground">Admins</CardTitle> {/* Adjusted size */}
              <ShieldCheck className="h-5 w-5 text-accent" /> {/* Use Accent color, increased size */}
            </CardHeader>
            <CardContent className="p-4"> {/* Adjusted padding */}
              <div className="text-2xl font-bold text-primary">Manage Admins</div> {/* Use Primary color */}
              <p className="text-xs text-muted-foreground mt-1">View, add, edit, and delete admin accounts.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
       {/* Further dashboard elements can be added here */}
       {/* Example: A section for recent activity or statistics */}
       {/*
       <div className="mt-8">
         <h2 className="text-xl font-semibold text-primary mb-4">Recent Activity</h2>
         <Card className="border border-border bg-card">
           <CardContent className="p-4">
             <p className="text-muted-foreground">No recent activity to display.</p>
             // Or display actual activity logs
           </CardContent>
         </Card>
       </div>
       */}
    </div>
  );
}
