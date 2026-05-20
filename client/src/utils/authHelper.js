// Simple auth helper for localStorage-based authentication
// This is a fallback when Supabase is not available

export const authHelper = {
  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const profile = JSON.parse(localStorage.getItem("userProfile") || "null");
      if (profile) {
        return {
          id: 'local-user',
          name: profile.name,
          email: profile.email || 'user@example.com',
          profile: profile
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  // Set current user in localStorage
  setCurrentUser: (userData) => {
    try {
      localStorage.setItem("userProfile", JSON.stringify(userData));
      // Trigger event for other components to update
      window.dispatchEvent(new Event("usernameUpdated"));
      return true;
    } catch (error) {
      console.error("Error setting current user:", error);
      return false;
    }
  },

  // Check if user is logged in
  isLoggedIn: () => {
    const user = authHelper.getCurrentUser();
    return user !== null;
  },

  // Logout user
  logout: () => {
    try {
      localStorage.removeItem("userProfile");
      localStorage.removeItem("userProfileImage");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("authToken");
      localStorage.removeItem("loggedUser");
      localStorage.removeItem("role");
      localStorage.removeItem("rs_session");
      localStorage.removeItem("rs_token");
      sessionStorage.clear();

      // Trigger event for other components to update
      window.dispatchEvent(new Event("usernameUpdated"));
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      return false;
    }
  },

  // Create a test user for demo purposes
  createTestUser: () => {
    const testUser = {
      name: "Demo User",
      email: "demo@roofscout.com",
      phone: "+91 9876543210",
      address: "Mohali, Punjab"
    };

    authHelper.setCurrentUser(testUser);
    console.log("✅ Demo user created:", testUser);
    return testUser;
  }
};

// Auto-create test user if none exists (for demo purposes)
// Disabled to prevent persistent session bugs
// if (typeof window !== 'undefined' && !authHelper.isLoggedIn()) {
//   console.log("No user found, creating demo user...");
//   authHelper.createTestUser();
// }

export default authHelper;