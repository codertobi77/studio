"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus, Loader2, AlertTriangle, Info, Search } from "lucide-react"; // Added Search
import { User, Role } from "@/services/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"; // Import Input for search

interface UserTableProps {
  users: User[];
  role: Role;
  roleDisplayName: string;
  isLoading: boolean;
  error: string | null;
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => Promise<void>;
}

export function UserTable({
  users,
  role,
  roleDisplayName,
  isLoading,
  error,
  onAdd,
  onEdit,
  onDelete,
}: UserTableProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState(""); // State for search term

  const handleDeleteClick = async (userId: string, username: string) => {
    setIsDeleting(userId);
    try {
      await onDelete(userId);
      toast({
        title: "User Deleted",
        description: `User "${username}" (${role}) has been deleted.`,
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to delete user:", err);
      const errorMessage = err instanceof Error ? err.message : "Could not delete the user. Please try again.";
      toast({
        title: "Deletion Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Filter users based on search term (case-insensitive)
  const filteredUsers = React.useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const hasUsers = users.length > 0;
  const hasFilteredUsers = filteredUsers.length > 0;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-primary flex-shrink-0">Manage {roleDisplayName}</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
           {/* Search Input - Only show if there are users to search */}
           {hasUsers && (
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={`Search ${roleDisplayName.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 h-10 bg-input" // Adjust padding and height
                  aria-label={`Search ${roleDisplayName}`}
                />
              </div>
           )}
           {/* Add User Button */}
           <Button onClick={onAdd} className="w-full sm:w-auto flex-shrink-0">
              <UserPlus className="mr-2 h-4 w-4" /> Add {roleDisplayName.slice(0, -1)}
            </Button>
        </div>
      </div>

      {/* Conditional Rendering: Loading, Error, Empty, Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16 border border-dashed rounded-lg bg-card text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading {roleDisplayName.toLowerCase()}...</span>
        </div>
      ) : error ? (
         <Alert variant="destructive" className="max-w-3xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading {roleDisplayName}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      ) : !hasUsers ? ( // Initial empty state (before any search)
        <div className="text-center py-16 border border-dashed rounded-lg bg-card">
          <Info className="mx-auto h-10 w-10 mb-3 text-muted-foreground/60" />
          <p className="text-lg font-medium text-foreground mb-1">No {roleDisplayName.toLowerCase()} found.</p>
          <p className="text-muted-foreground mb-4">Get started by adding the first user.</p>
          <Button onClick={onAdd} variant="default" size="sm">
            <UserPlus className="mr-2 h-4 w-4" /> Add First {roleDisplayName.slice(0, -1)}
          </Button>
        </div>
      ) : !hasFilteredUsers ? ( // Empty state after search
        <div className="text-center py-16 border border-dashed rounded-lg bg-card">
           <Search className="mx-auto h-10 w-10 mb-3 text-muted-foreground/60" />
           <p className="text-lg font-medium text-foreground mb-1">No Results Found</p>
           <p className="text-muted-foreground">Your search for "{searchTerm}" did not match any {roleDisplayName.toLowerCase()}.</p>
           <Button variant="link" onClick={() => setSearchTerm("")} className="mt-3 text-accent">
                Clear Search
           </Button>
        </div>
      ) : ( // Table View
        <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[35%] px-4 py-3 text-sm font-medium text-muted-foreground">Username</TableHead>
                <TableHead className="w-[45%] px-4 py-3 text-sm font-medium text-muted-foreground">Email</TableHead>
                <TableHead className="w-[20%] text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors duration-150">
                  <TableCell className="font-medium px-4 py-3 text-sm text-foreground">{user.username}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-right space-x-1 px-4 py-3">
                    {/* Edit Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground transition-colors hover:text-primary hover:bg-primary/10 focus-visible:ring-1 focus-visible:ring-primary"
                      onClick={() => onEdit(user)}
                      aria-label={`Edit ${user.username}`}
                      title={`Edit ${user.username}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {/* Delete Button Dialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground transition-colors hover:text-destructive hover:bg-destructive/10 focus-visible:ring-1 focus-visible:ring-destructive"
                          disabled={isDeleting === user.id}
                          aria-label={`Delete ${user.username}`}
                          title={`Delete ${user.username}`}
                        >
                          {isDeleting === user.id ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete the user{' '}
                            <strong className="font-medium text-foreground">{user.username}</strong> ({role}).
                            This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-2">
                          <AlertDialogCancel disabled={isDeleting === user.id}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                             onClick={() => handleDeleteClick(user.id, user.username)}
                             disabled={isDeleting === user.id}
                             className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive"
                           >
                             {isDeleting === user.id ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Deleting...</>
                             ) : (
                                "Confirm Delete"
                             )}
                           </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
