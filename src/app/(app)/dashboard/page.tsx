import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShoppingCart, Building, UserCog, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8"> {/* Consistent outer spacing */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Marketplace Admin Hub. Manage users by role below.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Buyer Card */}
        <Link href="/dashboard/users/acheteurs" className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
          <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30 group-hover:bg-secondary/50 transition-colors">
              <CardTitle className="text-base font-medium text-secondary-foreground">Acheteurs</CardTitle>
              <ShoppingCart className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent className="p-4 space-y-1"> {/* Added space-y-1 */}
              <div className="text-2xl font-bold text-primary">Manage Buyers</div>
              <p className="text-xs text-muted-foreground">View, add, edit, and delete buyer accounts.</p>
            </CardContent>
          </Card>
        </Link>

        {/* Seller Card */}
        <Link href="/dashboard/users/vendeurs" className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
          <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30 group-hover:bg-secondary/50 transition-colors">
              <CardTitle className="text-base font-medium text-secondary-foreground">Vendeurs</CardTitle>
              <Building className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent className="p-4 space-y-1"> {/* Added space-y-1 */}
              <div className="text-2xl font-bold text-primary">Manage Sellers</div>
              <p className="text-xs text-muted-foreground">View, add, edit, and delete seller accounts.</p>
            </CardContent>
          </Card>
        </Link>

        {/* Manager Card */}
        <Link href="/dashboard/users/gestionnaires" className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
          <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30 group-hover:bg-secondary/50 transition-colors">
              <CardTitle className="text-base font-medium text-secondary-foreground">Gestionnaires</CardTitle>
              <UserCog className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent className="p-4 space-y-1"> {/* Added space-y-1 */}
              <div className="text-2xl font-bold text-primary">Manage Managers</div>
              <p className="text-xs text-muted-foreground">View, add, edit, and delete manager accounts.</p>
            </CardContent>
          </Card>
        </Link>

        {/* Admin Card */}
         <Link href="/dashboard/users/admins" className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
           <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-border bg-card text-card-foreground rounded-lg overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-secondary/30 group-hover:bg-secondary/50 transition-colors">
              <CardTitle className="text-base font-medium text-secondary-foreground">Admins</CardTitle>
              <ShieldCheck className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent className="p-4 space-y-1"> {/* Added space-y-1 */}
              <div className="text-2xl font-bold text-primary">Manage Admins</div>
              <p className="text-xs text-muted-foreground">View, add, edit, and delete admin accounts.</p>
            </CardContent>
          </Card>
        </Link>
      </div>

       {/* Placeholder for future dashboard elements */}
       {/*
       <div className="mt-10"> // Increased margin-top
         <h2 className="text-2xl font-semibold text-primary mb-4">Recent Activity</h2> // Larger heading
         <Card className="border border-border bg-card shadow-sm"> // Added shadow
           <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>Latest actions performed by administrators.</CardDescription>
           </CardHeader>
           <CardContent className="p-4">
             <div className="text-center text-muted-foreground p-6 border border-dashed rounded-md"> // Centered placeholder
                <p>No recent activity to display.</p>
             </div>
             // TODO: Implement activity log display here
           </CardContent>
         </Card>
       </div>
       */}
    </div>
  );
}
