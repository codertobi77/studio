"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose, // Import DialogClose
} from "@/components/ui/dialog";
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
import { User, Role, createUser, updateUser } from "@/services/admin";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCircle, UserPlus } from "lucide-react"; // Added icons

// Schema definition remains the same
const userFormSchemaBase = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).trim(),
  email: z.string().email({ message: "Invalid email address." }).trim(),
});

const addUserSchema = userFormSchemaBase.extend({
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const editUserSchema = userFormSchemaBase.extend({
    password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional().or(z.literal('')),
});

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  userToEdit: User | null;
  onUserSaved: (user: User) => void;
}

export function UserFormDialog({
  isOpen,
  onClose,
  role,
  userToEdit,
  onUserSaved,
}: UserFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditing = !!userToEdit;

  const currentSchema = isEditing ? editUserSchema : addUserSchema;
  type CurrentUserFormValues = z.infer<typeof currentSchema>;

  const form = useForm<CurrentUserFormValues>({
    resolver: zodResolver(currentSchema),
    // Default values are set in useEffect
  });

  // Reset form when dialog opens or userToEdit changes
  React.useEffect(() => {
    if (isOpen) {
      form.reset(
        isEditing
          ? { username: userToEdit?.username || "", email: userToEdit?.email || "", password: "" }
          : { username: "", email: "", password: "" }
      );
      form.clearErrors();
    }
  }, [isOpen, isEditing, userToEdit, form]);


  async function onSubmit(data: CurrentUserFormValues) {
    setIsLoading(true);
    try {
      let savedUser: User;
      const userData: Partial<Omit<User, 'id' | 'role'>> & { password?: string } = {
         username: data.username,
         email: data.email,
      };

      if (data.password && data.password.trim() !== '') {
         userData.password = data.password;
      } else if (!isEditing && (!data.password || data.password.trim() === '')) {
          // Re-validate password requirement for adding user (should be caught by zod, but good fallback)
          form.setError("password", { type: "manual", message: "Password is required when adding a new user." });
          setIsLoading(false);
          return;
      }

      if (isEditing && userToEdit) {
        savedUser = await updateUser(role, userToEdit.id, { ...userData, role });
        toast({
          title: "User Updated Successfully",
          description: `Details for ${savedUser.username} (${role}) have been saved.`,
        });
      } else {
        // Create user requires password ensured by schema/check above
        savedUser = await createUser(role, {
            username: userData.username!,
            email: userData.email!,
            password: userData.password!,
            role: role
        });
        toast({
          title: "User Created Successfully",
          description: `${savedUser.username} (${role}) has been added. Email verification may be required.`,
        });
      }
      onUserSaved(savedUser);
      onClose();
    } catch (error) {
      console.error("Failed to save user:", error);
      const action = isEditing ? 'update' : 'create';
      const errorMessage = error instanceof Error ? error.message : `Could not ${action} the user. Please check the details and try again.`;
      toast({
        title: `Failed to ${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Dynamic title and description
  const roleDisplayName = role.charAt(0).toUpperCase() + role.slice(1);
  const title = isEditing ? `Edit ${roleDisplayName}` : `Add New ${roleDisplayName}`;
  const description = isEditing
    ? `Modify the details for ${userToEdit?.username || 'this user'}.`
    : `Enter the details for the new ${roleDisplayName.toLowerCase()}.`;
  const Icon = isEditing ? UserCircle : UserPlus;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg"> {/* Adjusted max-width */}
        <DialogHeader className="mb-4"> {/* Added margin bottom */}
          <div className="flex items-center gap-3 mb-2">
              <Icon className="h-6 w-6 text-primary" />
              <DialogTitle className="text-xl">{title}</DialogTitle> {/* Slightly larger title */}
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> {/* Increased spacing */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., john.doe" {...field} disabled={isLoading} className="bg-input focus:ring-primary focus:border-primary"/>
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
                    <Input type="email" placeholder="e.g., user@example.com" {...field} disabled={isLoading} className="bg-input focus:ring-primary focus:border-primary"/>
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
                        placeholder={isEditing ? "Leave blank to keep current" : "Enter password"}
                        {...field}
                        disabled={isLoading}
                        className="bg-input focus:ring-primary focus:border-primary"
                    />
                  </FormControl>
                   <FormDescription>
                      {isEditing ? "Enter a new password only if you want to change it (min. 6 characters)." : "Minimum 6 characters required."}
                    </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter className="pt-6 gap-2 sm:gap-0"> {/* Added gap for mobile */}
                {/* Use DialogClose for the cancel button for better accessibility */}
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                   {isLoading ? (
                       <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                   ) : (
                       isEditing ? "Save Changes" : "Create User"
                   )}
                </Button>
             </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
