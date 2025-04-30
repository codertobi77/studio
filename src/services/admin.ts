/**
 * Represents a user role.
 */
export type Role = 'acheteur' | 'vendeur' | 'gestionnaire' | 'admin';

/**
 * Represents a user object returned by the API.
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  // Add other potential fields like createdAt, updatedAt, status, etc.
  createdAt?: string;
  isVerified?: boolean;
}

/**
 * Represents data needed to create a user (excluding id).
 */
export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'isVerified'> & { password?: string }; // Password required for creation

/**
 * Represents data allowed for updating a user (all fields optional, except role usually fixed).
 */
export type UpdateUserData = Partial<Omit<User, 'id' | 'role' | 'createdAt'>> & { password?: string }; // Password optional for update


const API_BASE_URL = "/api/admin"; // Base URL for admin API endpoints

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get token from localStorage (for client-side API calls)
const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem("authToken");
}

// Helper to construct fetch options with Auth header
const getAuthHeaders = (): HeadersInit => {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<T> {
    const result = await response.json();
    if (!response.ok) {
        console.error(`API Error (${response.status}):`, result);
        // Handle specific auth errors
        if (response.status === 401) {
            throw new Error(result.message || "Unauthorized. Please log in again.");
        }
         if (response.status === 403) {
            throw new Error(result.message || "Forbidden. You do not have permission to perform this action.");
        }
        throw new Error(result.message || `Request failed with status ${response.status}`);
    }
    console.log("API Success:", result);
    return result.data || result; // Assuming data might be nested under 'data' key, or is the root object
}


/**
 * Asynchronously retrieves all users for a given role via API.
 *
 * @param role The role of the users to retrieve.
 * @returns A promise that resolves to an array of User objects.
 * @throws Will throw an error if the API call fails.
 */
export async function getUsers(role: Role): Promise<User[]> {
  console.log(`Fetching users for role: ${role}`);
  await delay(400); // Simulate network delay

  try {
      const response = await fetch(`${API_BASE_URL}/${role}`, {
          method: 'GET',
          headers: getAuthHeaders(),
      });
      const result = await handleApiResponse<{ users: User[] }>(response); // Expect { users: [...] }
      return result.users || []; // Return users array or empty if missing
  } catch (error) {
      console.error(`Failed to fetch ${role} users:`, error);
      throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Asynchronously retrieves a single user by ID and role via API.
 *
 * @param role The role of the user.
 * @param id The ID of the user.
 * @returns A promise that resolves to a User object or null if not found (API should return 404).
 * @throws Will throw an error if the API call fails (e.g., 401, 500).
 */
export async function getUser(role: Role, id: string): Promise<User | null> {
   console.log(`Fetching user with ID: ${id} for role: ${role}`);
   await delay(300);

   try {
       const response = await fetch(`${API_BASE_URL}/${role}/${id}`, {
           method: 'GET',
           headers: getAuthHeaders(),
       });
        if (response.status === 404) {
            console.log(`User ${id} (${role}) not found.`);
            return null; // Return null if API returns 404
        }
       const result = await handleApiResponse<{ user: User }>(response); // Expect { user: {...} }
       return result.user;
   } catch (error) {
       console.error(`Failed to fetch user ${id} (${role}):`, error);
       throw error;
   }
}

/**
 * Asynchronously creates a new user via API.
 *
 * @param role The role of the user to create.
 * @param userData The data for the new user (including password).
 * @returns A promise that resolves to the created User object.
 * @throws Will throw an error if the API call fails.
 */
export async function createUser(role: Role, userData: CreateUserData): Promise<User> {
   console.log(`Creating new ${role} user:`, userData.username);
   await delay(500);

    if (!userData.password) {
        throw new Error("Password is required to create a new user.");
    }

   try {
       const response = await fetch(`${API_BASE_URL}/${role}`, {
           method: 'POST',
           headers: getAuthHeaders(),
           body: JSON.stringify(userData),
       });
       const result = await handleApiResponse<{ user: User }>(response); // Expect { user: {...} }
       return result.user;
   } catch (error) {
       console.error(`Failed to create ${role} user:`, error);
       throw error;
   }
}

/**
 * Asynchronously updates an existing user via API.
 *
 * @param role The role of the user.
 * @param id The ID of the user to update.
 * @param userData The fields to update (password is optional).
 * @returns A promise that resolves to the updated User object.
 * @throws Will throw an error if the API call fails.
 */
export async function updateUser(role: Role, id: string, userData: UpdateUserData): Promise<User> {
   console.log(`Updating user ${id} (${role}) with data:`, userData);
   await delay(400);

    // Remove password field if it's empty or just whitespace
    const updateData = { ...userData };
    if (updateData.password !== undefined && updateData.password.trim() === '') {
        delete updateData.password;
    }

   try {
       const response = await fetch(`${API_BASE_URL}/${role}/${id}`, {
           method: 'PUT',
           headers: getAuthHeaders(),
           body: JSON.stringify(updateData),
       });
       const result = await handleApiResponse<{ user: User }>(response); // Expect { user: {...} }
       return result.user;
   } catch (error) {
       console.error(`Failed to update user ${id} (${role}):`, error);
       throw error;
   }
}

/**
 * Asynchronously deletes a user by ID and role via API.
 *
 * @param role The role of the user.
 * @param id The ID of the user to delete.
 * @returns A promise that resolves to void on success.
 * @throws Will throw an error if the API call fails.
 */
export async function deleteUser(role: Role, id: string): Promise<void> {
   console.log(`Deleting user ${id} (${role})`);
   await delay(600); // Simulate slower deletion

   try {
       const response = await fetch(`${API_BASE_URL}/${role}/${id}`, {
           method: 'DELETE',
           headers: getAuthHeaders(),
       });

       // DELETE might return 204 No Content on success, or 200/202 with a body
        if (response.status === 204) {
            console.log(`User ${id} (${role}) deleted successfully (204 No Content).`);
            return; // Success
        }

       // If not 204, handle as usual (expecting JSON potentially)
       await handleApiResponse(response); // Check for errors, ignore success body if any
       console.log(`User ${id} (${role}) deleted successfully (Status ${response.status}).`);

   } catch (error) {
       console.error(`Failed to delete user ${id} (${role}):`, error);
       throw error;
   }
}
