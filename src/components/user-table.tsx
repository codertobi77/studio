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
import { Pencil, Trash2, UserPlus, Loader2, AlertTriangle, Info } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert

interface UserTableProps {
  users: User[];
  role: Role;
  roleDisplayName: string; // Added prop for display name
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

  const handleDeleteClick = async (userId: string, username: string) => {
    setIsDeleting(userId);
    try {
      await onDelete(userId);
      toast({
        title: "User Deleted",
        description: `User "${username}" has been successfully deleted.`,
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

  return (
    <div className="space-y-6"> {/* Increased spacing */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold text-primary">Manage {roleDisplayName}</h2>
        <Button onClick={onAdd} className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" /> Add {roleDisplayName.slice(0, -1)} {/* Singular role name */}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-10 border border-dashed rounded-md bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading {roleDisplayName.toLowerCase()}...</span>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && users.length === 0 && (
        <div className="text-center text-muted-foreground py-10 border border-dashed rounded-md bg-card">
          <Info className="mx-auto h-8 w-8 mb-2 text-muted-foreground/50" />
          No {roleDisplayName.toLowerCase()} found.
          <Button variant="link" onClick={onAdd} className="block mx-auto mt-2 text-accent">
            Add the first {roleDisplayName.slice(0, -1).toLowerCase()}?
          </Button>
        </div>
      )}

      {/* Table View */}
      {!isLoading && !error && users.length > 0 && (
        <div className="rounded-lg border shadow-sm overflow-hidden bg-card"> {/* Rounded corners and explicit background */}
          <Table>
            <TableHeader className="bg-muted/50"> {/* Header background */}
              <TableRow>
                <TableHead className="w-[35%] px-4 py-3">Username</TableHead>
                <TableHead className="w-[45%] px-4 py-3">Email</TableHead>
                <TableHead className="w-[20%] text-right px-4 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium px-4 py-3">{user.username}</TableCell>
                  <TableCell className="px-4 py-3">{user.email}</TableCell>
                  <TableCell className="text-right space-x-1 px-4 py-3"> {/* Reduced space */}
                    <Button
                      variant="ghost" // Ghost variant for less emphasis
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" // Adjusted size and styling
                      onClick={() => onEdit(user)}
                      aria-label={`Edit user ${user.username}`}
                      title={`Edit ${user.username}`} // Tooltip text
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost" // Ghost variant for less emphasis
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" // Adjusted size and styling
                          disabled={isDeleting === user.id}
                          aria-label={`Delete user ${user.username}`}
                          title={`Delete ${user.username}`} // Tooltip text
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
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete the user{' '}
                            <strong className="text-foreground">{user.username}</strong>?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting === user.id}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                             onClick={() => handleDeleteClick(user.id, user.username)}
                             disabled={isDeleting === user.id}
                             className="bg-destructive text-destructive-foreground hover:bg-destructive/90" // Ensure correct styling
                           >
                             {isDeleting === user.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Deleting...</> : "Delete User"}
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
