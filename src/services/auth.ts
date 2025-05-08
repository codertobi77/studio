
export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional for profile updates, required for registration
  role: string;
}

export interface UserLoginData {
  email: string;
  password?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  token?: string;
  profile?: any; // Consider defining a UserProfile type
}

// Updated API base URL as per user request
const API_BASE_URL = "/api/auth"; // Base URL for authentication API endpoints


// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get token from localStorage (for client-side API calls)
const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem("authToken");
}

// Helper function to handle API responses (can be shared or specific to auth)
async function handleAuthApiResponse<T>(response: Response): Promise<T> {
    // Check for 204 No Content before attempting to parse JSON (e.g., for logout)
    if (response.status === 204) {
        console.log("Auth API Success (204 No Content)");
        return {} as T; // Return empty object or adjust based on expected type T
    }

    const result = await response.json();
    if (!response.ok) {
        console.error(`Auth API Error (${response.status}):`, result);
        // Handle specific auth errors like 401, 403 if needed differently than generic errors
        if (response.status === 401) {
            throw new Error(result.message || "Authentication failed or session expired. Please log in again.");
        }
        throw new Error(result.message || `Request failed with status ${response.status}`);
    }
    console.log("Auth API Success:", result);
    // Adjust based on expected API response structure (e.g., result.data, result.token, result.profile)
    return result; // Return the full result by default
}


/**
 * Asynchronously registers a new user by calling the API.
 * Endpoint: POST /api/auth/register
 * @param userData The user data including firstName, lastName, email, password, role.
 * @returns A promise that resolves to the AuthResult.
 */
export async function register(userData: UserRegistrationData): Promise<AuthResult> {
  console.log("Attempting registration with data:", { email: userData.email, firstName: userData.firstName, lastName: userData.lastName, role: userData.role });
  await delay(500); // Simulate network delay

  try {
      const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
      });

      // Use the specific handler or a generic one
      const result = await handleAuthApiResponse<AuthResult>(response);

      // Assuming API returns { success: boolean, message: string }
      return {
          success: true, // If handleApiResponse didn't throw, assume success
          message: result.message || 'Registration successful. Please check your email to verify your account.',
          // No token typically returned on register, adjust if API differs
      };
  } catch (error) {
       console.error("Registration failed:", error);
       const message = error instanceof Error ? error.message : 'An unknown error occurred during registration.';
        return { success: false, message };
  }
}

/**
 * Asynchronously logs in an existing user by calling the API.
 * Endpoint: POST /api/auth/login
 * @param credentials The user credentials (email, password).
 * @returns A promise that resolves to the AuthResult containing a token on success.
 */
export async function login(credentials: UserLoginData): Promise<AuthResult> {
  console.log("Attempting login with credentials:", credentials.email);
  await delay(500); // Simulate network delay

   try {
       const response = await fetch(`${API_BASE_URL}/login`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(credentials),
       });

       const result = await handleAuthApiResponse<AuthResult>(response);

       // Login should return a token
       if (!result.token) {
           throw new Error("Login successful but no token received from API.");
       }

       return {
           success: true,
           message: result.message || 'Login successful.',
           token: result.token,
           profile: result.profile || null, // Optionally return profile if API provides it on login
       };
   } catch (error) {
        console.error("Login failed:", error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred during login.';
         return { success: false, message };
   }
}

/**
 * Asynchronously logs out the current user by calling the API.
 * Endpoint: POST /api/auth/logout
 * (Might just involve clearing local token, but good practice to have an endpoint).
 *
 * @returns A promise that resolves to the AuthResult.
 */
export async function logout(): Promise<AuthResult> {
   console.log("Attempting logout.");
   await delay(200); // Simulate network delay
   const token = getToken();

    // API call is optional, backend might just rely on token expiry
    // If an endpoint exists, call it
    try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // Send token if required by API
                'Content-Type': 'application/json', // If sending body
            },
            // body: JSON.stringify({}), // Optional body
        });

        // Use handleAuthApiResponse to check for errors, ignore success response body
        await handleAuthApiResponse<void>(response);
        console.log("Logout API Success");

    } catch (error) {
         console.warn("Logout API call failed:", error);
         // Proceed with local logout even if API fails
    } finally {
        // Always return success for local cleanup regardless of API outcome
        return {
            success: true,
            message: 'Logout processed.',
        };
    }
}

/**
 * Asynchronously retrieves the user profile by calling the API.
 * Endpoint: GET /api/auth/profile
 * Requires authentication token.
 *
 * @returns A promise that resolves to the user profile data.
 * @throws Will throw an error if the API call fails or token is missing/invalid.
 */
export async function getProfile(): Promise<any> { // Consider defining UserProfile type
    console.log("Attempting to fetch profile.");
    await delay(300); // Simulate network delay
    const token = getToken();

    if (!token) {
        console.error("Get Profile Error: No token found.");
        throw new Error("Authentication token not found. Please log in.");
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Send token in header
                'Content-Type': 'application/json',
            },
        });

        // Expecting { profile: {...} } structure based on previous code
        const result = await handleAuthApiResponse<{ profile?: any }>(response);

        if (!result.profile) {
             throw new Error("Profile data not found in API response.");
        }
        // Return only the profile part of the response
        return result.profile;

    } catch (error) {
         console.error("Get profile failed:", error);
         // Re-throw the error to be caught by the calling component
         throw error;
    }
}

/**
 * Asynchronously verifies the user's email by calling the API with a token.
 * Endpoint: POST /api/auth/verify-email
 *
 * @param token The email verification token from the URL.
 * @returns A promise that resolves to the AuthResult.
 */
export async function verifyEmail(token: string): Promise<AuthResult> {
   console.log("Attempting email verification with token:", token);
   await delay(600); // Simulate network delay

    if (!token || typeof token !== 'string' || token.length < 10) {
        return { success: false, message: "Invalid or missing verification token." };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send token in the body or as a query param depending on API design
            body: JSON.stringify({ token }),
        });

        const result = await handleAuthApiResponse<AuthResult>(response);

        return {
            success: true, // If handleAuthApiResponse didn't throw
            message: result.message || 'Email verification successful.',
        };
    } catch (error) {
         console.error("Email verification failed:", error);
         const message = error instanceof Error ? error.message : 'An unknown error occurred during email verification.';
          return { success: false, message };
    }
}

