"use client";

import * as React from "react";
import { useParams, useRouter, usePathname } from "next/navigation"; // Added usePathname
import { getUsers, deleteUser, User, Role } from "@/services/admin";
import { UserTable } from "@/components/user-table";
import { UserFormDialog } from "@/components/user-form-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react"; // Icon for error

// Helper to validate role from URL params
const isValidRole = (role: string | string[] | undefined): role is Role => {
  if (!role || typeof role !== 'string') return false;
  return ['acheteur', 'vendeur', 'gestionnaire', 'admin'].includes(role);
};

// Map roles to display names (optional, for better UI text)
const roleDisplayNames: Record<Role, string> = {
    acheteur: "Buyers",
    vendeur: "Sellers",
    gestionnaire: "Managers",
    admin: "Admins"
};

export default function UsersPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname(); // Get current path for better feedback
  const roleParam = params.role;

  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [userToEdit, setUserToEdit] = React.useState<User | null>(null);

  // Validate role once when params change
  const role = React.useMemo(() => {
      if (isValidRole(roleParam)) {
          return roleParam;
      }
      return null;
  }, [roleParam]);

  React.useEffect(() => {
    if (!role) {
      setError(`Invalid user role specified in URL: ${roleParam}. Please select a valid role.`);
      setIsLoading(false);
      // No automatic redirect, show error message instead
      return;
    }

    // Clear previous errors when role changes
    setError(null);
    setIsLoading(true);

    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers(role);
        setUsers(fetchedUsers);
      } catch (err) {
        console.error(`Failed to fetch ${roleDisplayNames[role]}:`, err);
        const errorMessage = err instanceof Error ? err.message : `Failed to load ${roleDisplayNames[role]}. Please try again later.`;
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [role, roleParam]); // Depend on validated 'role' and original 'roleParam' for error message

   const handleAddUser = () => {
    setUserToEdit(null); // Ensure we are in 'add' mode
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
     if (!role) return; // Should not happen if UI is driven by valid role, but good practice

     const previousUsers = [...users]; // Create a shallow copy for potential revert
     // Optimistic UI update: Remove user immediately
     setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));

    try {
      await deleteUser(role, userId);
       // No need to refetch if optimistic update is correct
       // const fetchedUsers = await getUsers(role); // Optionally refetch if backend might have side effects
       // setUsers(fetchedUsers);
    } catch (err) {
       console.error("Delete user failed:", err);
       // Revert optimistic update if deletion failed
       setUsers(previousUsers);
       // Re-throw the error so the UserTable component can show a toast
       throw err; // Propagate error to UserTable for toast notification
    }
  };

  const handleUserSaved = (savedUser: User) => {
     setUsers(currentUsers => {
        const userExists = currentUsers.some(user => user.id === savedUser.id);
        if (userExists) {
            // Update existing user
            return currentUsers.map(user => (user.id === savedUser.id ? savedUser : user));
        } else {
            // Add new user
            return [...currentUsers, savedUser];
        }
     });
     // Close the form after saving
     setIsFormOpen(false);
     setUserToEdit(null); // Reset edit state
   };

  // Render error message if the role is invalid after initial check
  if (!role && !isLoading) {
     return (
        <div className="container mx-auto py-10">
             <Alert variant="destructive">
               <Terminal className="h-4 w-4" />
               <AlertTitle>Invalid Role</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
               {/* Optional: Button to go back */}
               {/* <Button onClick={() => router.back()} variant="outline" className="mt-4">Go Back</Button> */}
             </Alert>
        </div>
     );
   }

   // Render loading or table based on state
   // Role is guaranteed to be valid here if we didn't return the error component
   const validRole = role as Role; // Type assertion is safe here

  return (
    <div className="container mx-auto py-6">
      <UserTable
        users={users}
        role={validRole} // Pass the validated role
        roleDisplayName={roleDisplayNames[validRole]} // Pass display name
        isLoading={isLoading}
        error={error && !users.length ? error : null} // Only show table-level error if no users are displayed
        onAdd={handleAddUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
       {isFormOpen && ( // Conditionally render dialog to ensure clean state on open
         <UserFormDialog
            isOpen={isFormOpen}
            onClose={() => {
                setIsFormOpen(false);
                setUserToEdit(null); // Reset edit state on close
            }}
            role={validRole} // Pass the validated role
            userToEdit={userToEdit}
            onUserSaved={handleUserSaved}
         />
       )}
    </div>
  );
}
