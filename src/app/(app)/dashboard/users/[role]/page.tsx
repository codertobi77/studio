"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { getUsers, deleteUser, User, Role } from "@/services/admin";
import { UserTable } from "@/components/user-table";
import { UserFormDialog } from "@/components/user-form-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, AlertTriangle } from "lucide-react"; // Added AlertTriangle for invalid role

// Helper to validate role from URL params
const isValidRole = (role: string | string[] | undefined): role is Role => {
  if (!role || typeof role !== 'string') return false;
  return ['acheteur', 'vendeur', 'gestionnaire', 'admin'].includes(role);
};

// Map roles to display names
const roleDisplayNames: Record<Role, string> = {
    acheteur: "Buyers",
    vendeur: "Sellers",
    gestionnaire: "Managers",
    admin: "Admins"
};

export default function UsersPage() {
  const params = useParams();
  const router = useRouter();
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
      // Set a specific error message for invalid role
      setError(`Invalid user role specified: "${roleParam}". Please select a valid role from the dashboard.`);
      setIsLoading(false);
      setUsers([]); // Clear any potentially stale user data
      return;
    }

    // Clear previous errors and reset loading state when role changes
    setError(null);
    setIsLoading(true);
    setUsers([]); // Clear users while loading new role data

    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers(role);
        setUsers(fetchedUsers);
      } catch (err) {
        console.error(`Failed to fetch ${roleDisplayNames[role]}:`, err);
        const errorMessage = err instanceof Error ? err.message : `Failed to load ${roleDisplayNames[role]}. Please check connectivity or try again later.`;
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [role, roleParam]); // Rerun effect when the validated 'role' changes

   const handleAddUser = () => {
    setUserToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
     if (!role) return; // Safety check

     const previousUsers = [...users];
     setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));

    try {
      await deleteUser(role, userId);
       // Success handled via toast in UserTable
    } catch (err) {
       console.error("Delete user failed:", err);
       setUsers(previousUsers); // Revert optimistic update
       throw err; // Propagate for toast notification
    }
  };

  const handleUserSaved = (savedUser: User) => {
     setUsers(currentUsers => {
        const userIndex = currentUsers.findIndex(user => user.id === savedUser.id);
        if (userIndex > -1) {
            // Update existing user in place
            const updatedUsers = [...currentUsers];
            updatedUsers[userIndex] = savedUser;
            return updatedUsers;
        } else {
            // Add new user to the end (or beginning)
            return [...currentUsers, savedUser];
        }
     });
     setIsFormOpen(false);
     setUserToEdit(null);
   };

  // Render error message clearly if the role is invalid (checked after initial load/validation)
  if (!isLoading && !role) {
     return (
        <div className="container mx-auto py-10 px-4 md:px-6">
             <Alert variant="destructive" className="max-w-2xl mx-auto">
               <AlertTriangle className="h-4 w-4" /> {/* More appropriate icon */}
               <AlertTitle>Invalid Role Specified</AlertTitle>
               <AlertDescription>
                   {error || `The role "${roleParam}" is not valid.`} Please navigate using the dashboard links.
                </AlertDescription>
               {/* <Button onClick={() => router.push('/dashboard')} variant="outline" className="mt-4">Go to Dashboard</Button> */}
             </Alert>
        </div>
     );
   }

   // Role is guaranteed to be valid here if we didn't return the error component
   const validRole = role as Role; // Type assertion is safe

  return (
    <div className="container mx-auto py-6 px-4 md:px-6"> {/* Consistent padding */}
      <UserTable
        users={users}
        role={validRole}
        roleDisplayName={roleDisplayNames[validRole]}
        isLoading={isLoading}
        // Show main error if loading failed AND there are no users currently displayed
        error={error && !isLoading && users.length === 0 ? error : null}
        onAdd={handleAddUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
       {/* Conditionally render dialog to ensure clean state on open */}
       {isFormOpen && (
         <UserFormDialog
            isOpen={isFormOpen}
            onClose={() => {
                setIsFormOpen(false);
                setUserToEdit(null);
            }}
            role={validRole}
            userToEdit={userToEdit}
            onUserSaved={handleUserSaved}
         />
       )}
    </div>
  );
}
