"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { getUsers, deleteUser, User, Role } from "@/services/admin";
import { getProfile } from "@/services/auth"; // Import getProfile
import { UserTable } from "@/components/user-table";
import { UserFormDialog } from "@/components/user-form-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button"; // Import Button
import { Terminal, AlertTriangle, Loader2, ShieldAlert } from "lucide-react";

const isValidRole = (role: string | string[] | undefined): role is Role => {
  if (!role || typeof role !== 'string') return false;
  return ['acheteur', 'vendeur', 'gestionnaire', 'admin'].includes(role);
};

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

  const [currentUserProfile, setCurrentUserProfile] = React.useState<User | null>(null);
  const [isProfileLoading, setIsProfileLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [userToEdit, setUserToEdit] = React.useState<User | null>(null);

  const role = React.useMemo(() => {
      if (isValidRole(roleParam)) {
          return roleParam;
      }
      return null;
  }, [roleParam]);

  React.useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      setIsProfileLoading(true);
      setProfileError(null);
      try {
        const profile = await getProfile();
        setCurrentUserProfile(profile);
      } catch (err) {
        console.error("Failed to fetch current user profile:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load your profile.";
        setProfileError(errorMessage);
      } finally {
        setIsProfileLoading(false);
      }
    };
    fetchCurrentUserProfile();
  }, []);


  React.useEffect(() => {
    if (isProfileLoading || !currentUserProfile) return; // Wait for profile

    if (currentUserProfile.role !== 'admin') {
        setError("Access Denied: You do not have permission to manage users.");
        setIsLoading(false);
        setUsers([]);
        return;
    }

    if (!role) {
      setError(`Invalid user role specified: "${roleParam}". Please select a valid role from the dashboard.`);
      setIsLoading(false);
      setUsers([]);
      return;
    }

    setError(null);
    setIsLoading(true);
    setUsers([]);

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
  }, [role, roleParam, currentUserProfile, isProfileLoading]);

   const handleAddUser = () => {
    setUserToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
     if (!role) return;

     const previousUsers = [...users];
     setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));

    try {
      await deleteUser(role, userId);
    } catch (err) {
       console.error("Delete user failed:", err);
       setUsers(previousUsers);
       throw err;
    }
  };

  const handleUserSaved = (savedUser: User) => {
     setUsers(currentUsers => {
        const userIndex = currentUsers.findIndex(user => user.id === savedUser.id);
        if (userIndex > -1) {
            const updatedUsers = [...currentUsers];
            updatedUsers[userIndex] = savedUser;
            return updatedUsers;
        } else {
            return [...currentUsers, savedUser];
        }
     });
     setIsFormOpen(false);
     setUserToEdit(null);
   };

  if (isProfileLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Verifying access...</span>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 animate-in fade-in duration-300">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Profile</AlertTitle>
          <AlertDescription>{profileError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (currentUserProfile?.role !== 'admin') {
     return (
        <div className="container mx-auto py-10 px-4 md:px-6 animate-in fade-in duration-300">
             <Alert variant="destructive" className="max-w-2xl mx-auto">
               <ShieldAlert className="h-5 w-5" />
               <AlertTitle>Access Denied</AlertTitle>
               <AlertDescription>
                   You do not have permission to manage users. This section is restricted to administrators.
                </AlertDescription>
               <Button onClick={() => router.push('/dashboard')} variant="outline" className="mt-4">
                 Go to Dashboard
               </Button>
             </Alert>
        </div>
     );
  }

  if (!isLoading && !role && currentUserProfile?.role === 'admin') { // Role invalid, but user is admin
     return (
        <div className="container mx-auto py-10 px-4 md:px-6 animate-in fade-in duration-300">
             <Alert variant="destructive" className="max-w-2xl mx-auto">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle>Invalid Role Specified</AlertTitle>
               <AlertDescription>
                   {error || `The role "${roleParam}" is not valid.`} Please navigate using the dashboard links.
                </AlertDescription>
             </Alert>
        </div>
     );
   }

   const validRole = role as Role;

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 animate-in fade-in duration-300">
      <UserTable
        users={users}
        role={validRole}
        roleDisplayName={roleDisplayNames[validRole]}
        isLoading={isLoading}
        error={error && !isLoading && users.length === 0 ? error : null}
        onAdd={handleAddUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
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