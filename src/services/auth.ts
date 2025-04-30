export interface AuthResult {
  success: boolean;
  message: string;
  token?: string; // Token returned on successful login/register
  profile?: any; // User profile data returned on successful login/profile fetch
}

const API_BASE_URL = "/api/auth"; // Assuming API routes are under /api/auth

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get token from localStorage (for client-side API calls)
const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem("authToken");
}

/**
 * Asynchronously registers a new user by calling the API.
 *
 * @param userData The user data including username, email, password, role.
 * @returns A promise that resolves to the AuthResult.
 */
export async function register(userData: any): Promise<AuthResult> {
  console.log("Attempting registration with data:", userData);
  await delay(500); // Simulate network delay

  // Simulate API call
  try {
      const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
          console.error("Registration API Error:", result);
          throw new Error(result.message || `Registration failed with status ${response.status}`);
      }

      console.log("Registration API Success:", result);
      // Typically, registration doesn't return a token immediately, user needs to login or verify email.
      // We return success and message.
      return {
          success: true,
          message: result.message || 'Registration successful. Please check your email to verify your account.',
          // No token returned here in this flow
      };
  } catch (error) {
       console.error("Registration failed:", error);
       const message = error instanceof Error ? error.message : 'An unknown error occurred during registration.';
        return { success: false, message };
  }
}

/**
 * Asynchronously logs in an existing user by calling the API.
 *
 * @param credentials The user credentials (email, password).
 * @returns A promise that resolves to the AuthResult containing a token on success.
 */
export async function login(credentials: any): Promise<AuthResult> {
  console.log("Attempting login with credentials:", credentials.email);
  await delay(500); // Simulate network delay

   // Simulate API call
   try {
       const response = await fetch(`${API_BASE_URL}/login`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(credentials),
       });

       const result = await response.json();

       if (!response.ok) {
           console.error("Login API Error:", result);
           throw new Error(result.message || `Login failed with status ${response.status}`);
       }

       console.log("Login API Success:", result);
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
 * (Might just involve clearing local token, but good practice to have an endpoint).
 *
 * @returns A promise that resolves to the AuthResult.
 */
export async function logout(): Promise<AuthResult> {
   console.log("Attempting logout.");
   await delay(200); // Simulate network delay

    // Simulate API call (optional, depends on backend implementation)
    try {
        const token = getToken();
        // Example: Send request to invalidate token on backend
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // Example authorization header
            },
        });

        if (!response.ok) {
             const result = await response.json().catch(() => ({})); // Try to parse error, default to empty object
             console.warn("Logout API call failed (status ", response.status, "):", result.message || "No error message");
             // Proceed with local logout even if API fails
        } else {
            console.log("Logout API Success");
        }

        // Regardless of API success, return success for local cleanup
        return {
            success: true,
            message: 'Logout successful.',
        };
    } catch (error) {
         console.error("Logout failed:", error);
         // Still return success for local cleanup, but log the error
         const message = error instanceof Error ? error.message : 'An error occurred during logout API call.';
          // Don't surface this error to the user usually, just log it.
          // return { success: false, message }; // Uncomment if API failure should block logout
          return { success: true, message: 'Logout processed locally despite API error.' };
    }
}

/**
 * Asynchronously retrieves the user profile by calling the API.
 * Requires authentication token.
 *
 * @returns A promise that resolves to the user profile data.
 * @throws Will throw an error if the API call fails or token is missing/invalid.
 */
export async function getProfile(): Promise<any> {
    console.log("Attempting to fetch profile.");
    await delay(300); // Simulate network delay
    const token = getToken();

    if (!token) {
        console.error("Get Profile Error: No token found.");
        throw new Error("Authentication token not found. Please log in.");
    }

    // Simulate API call
    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Send token in header
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Get Profile API Error:", result);
            // Handle specific statuses like 401 Unauthorized
            if (response.status === 401) {
                 throw new Error(result.message || "Session expired or invalid. Please log in again.");
            }
            throw new Error(result.message || `Failed to fetch profile with status ${response.status}`);
        }

        console.log("Get Profile API Success:", result);
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

    // Simulate API call
    try {
        const response = await fetch(`${API_BASE_URL}/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send token in the body or as a query param depending on API design
            body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Email Verification API Error:", result);
            throw new Error(result.message || `Email verification failed with status ${response.status}`);
        }

        console.log("Email Verification API Success:", result);
        return {
            success: true,
            message: result.message || 'Email verification successful.',
        };
    } catch (error) {
         console.error("Email verification failed:", error);
         const message = error instanceof Error ? error.message : 'An unknown error occurred during email verification.';
          return { success: false, message };
    }
}
