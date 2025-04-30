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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription, // Import FormDescription
} from "@/components/ui/form";
import { User, Role, createUser, updateUser } from "@/services/admin"; // Combined imports
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react"; // Import Loader2

// Schema definition based on User interface and requirements
const userFormSchemaBase = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).trim(),
  email: z.string().email({ message: "Invalid email address." }).trim(),
  // Role is passed via props, not part of the form data itself
});

// Schema for adding a user (password required)
const addUserSchema = userFormSchemaBase.extend({
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

// Schema for editing a user (password optional)
const editUserSchema = userFormSchemaBase.extend({
    password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional().or(z.literal('')), // Allow empty string or min 6 chars
});


interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  userToEdit: User | null; // Pass user data for editing, null for adding
  onUserSaved: (user: User) => void; // Callback after saving
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

  // Dynamically select the schema based on add/edit mode
  const currentSchema = isEditing ? editUserSchema : addUserSchema;
  type CurrentUserFormValues = z.infer<typeof currentSchema>;

  const form = useForm<CurrentUserFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: isEditing
      ? { username: userToEdit?.username || "", email: userToEdit?.email || "", password: "" }
      : { username: "", email: "", password: "" },
  });

  // Reset form when dialog opens and based on edit/add mode
  React.useEffect(() => {
    if (isOpen) {
      form.reset(
        isEditing
          ? { username: userToEdit?.username || "", email: userToEdit?.email || "", password: "" }
          : { username: "", email: "", password: "" }
      );
      // Clear potential previous errors
      form.clearErrors();
    }
  }, [isOpen, isEditing, userToEdit, form]);


  async function onSubmit(data: CurrentUserFormValues) {
    setIsLoading(true);
    try {
      let savedUser: User;
       // Prepare data, removing password if it's empty during edit
       const userData: Partial<Omit<User, 'id' | 'role'>> & { password?: string } = {
         username: data.username,
         email: data.email,
       };

      // Only include password if it's provided (and not empty for edits)
      if (data.password && data.password.trim() !== '') {
         userData.password = data.password;
      } else if (!isEditing) {
          // This case should be caught by validation, but as a fallback:
          form.setError("password", { type: "manual", message: "Password is required for new users." });
          setIsLoading(false);
          return;
      }


      if (isEditing && userToEdit) {
        // Call updateUser API
        savedUser = await updateUser(role, userToEdit.id, { ...userData, role }); // Pass validated role
        toast({
          title: "User Updated",
          description: `User "${savedUser.username}" has been updated successfully.`,
        });
      } else {
        // Call createUser API - password is required by schema here
        savedUser = await createUser(role, {
            username: userData.username!, // username is required by base schema
            email: userData.email!, // email is required by base schema
            password: userData.password!, // password is required by addUserSchema
            role: role // Pass validated role
        });
        toast({
          title: "User Created",
          description: `User "${savedUser.username}" has been created successfully.`,
        });
      }
      onUserSaved(savedUser); // Notify parent component
      onClose(); // Close dialog on success
    } catch (error) {
      console.error("Failed to save user:", error);
      const errorMessage = error instanceof Error ? error.message : `Could not ${isEditing ? 'update' : 'create'} the user. Please try again.`;
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Determine title and description based on edit/add mode
  const roleDisplayName = role.charAt(0).toUpperCase() + role.slice(1);
  const title = isEditing ? `Edit ${roleDisplayName}: ${userToEdit?.username}` : `Add New ${roleDisplayName}`;
  const description = isEditing ? "Make changes to the user's details below." : `Enter the details for the new ${role}. Email verification might be required.`;


  return (
    // Use onOpenChange to handle closing via 'x' or outside click
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]"> {/* Slightly wider dialog */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          {/* Pass role explicitly to form if needed elsewhere, or use it directly */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4 pb-2"> {/* Adjusted padding and spacing */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe" {...field} disabled={isLoading} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@example.com" {...field} disabled={isLoading} />
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
                    <Input type="password" placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"} {...field} disabled={isLoading} />
                  </FormControl>
                   <FormDescription>
                      {isEditing ? "Enter a new password only if you want to change it." : "Minimum 6 characters required."}
                    </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter className="pt-4"> {/* Add padding top */}
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading} className="min-w-[120px]"> {/* Minimum width for button */}
                   {isLoading ? (
                       <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? "Saving..." : "Creating..."}</>
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
