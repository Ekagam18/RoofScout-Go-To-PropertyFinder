// ─── LOCAL AUTH — Backend Integration ───────────────────────────────────────
// Users are authenticated against the Express backend running on localhost:5000
// The current session (JWT token & user data) is securely stored in localStorage.

const SESSION_KEY = "rs_session";
const TOKEN_KEY = "rs_token";
const AUTH_CALLBACKS = [];
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/auth";

function getSession() {
    try {
        const s = localStorage.getItem(SESSION_KEY);
        return s ? JSON.parse(s) : null;
    } catch {
        return null;
    }
}

function setSession(user, token) {
    if (user && token) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
    }
    // Notify all listeners
    AUTH_CALLBACKS.forEach((cb) => cb(user));
}

export const localAuth = {
    // ── Sign Up ──────────────────────────────────────────────────────────────
    async signUp({ email, password, username, name }) {
        try {
            const finalUsername = username || email.split("@")[0];
            const finalName = name || finalUsername;

            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username: finalUsername, name: finalName })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                return { error: { message: result.message || "Signup failed." } };
            }

            // Since signup doesn't return a token in the current backend design,
            // we'll automatically log them in or just set the session.
            const user = result.user;
            setSession(user, "temp-token"); // temporary token until they login

            // Explicitly overwrite the legacy localStorage userProfile cache so dashboards don't load the previous person
            localStorage.setItem("userProfile", JSON.stringify({ name: finalName, email: email }));

            return { data: { user }, error: null };
        } catch (error) {
            return { error: { message: "Network error during signup." } };
        }
    },

    // ── Sign In ───────────────────────────────────────────────────────────────
    async signIn({ email, password }) {
        try {
            // Note: The backend currently expects 'username' and 'password' in the body.
            // But the frontend Login.jsx is passing { email, password }.
            // Since email/username are often used interchangeably in localAuth mock,
            // we will send the email as the username to the backend.
            const username = email;

            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                return { error: { message: result.message || "Invalid credentials." } };
            }

            setSession(result.user, result.token);
            return { data: { user: result.user }, error: null };
        } catch (error) {
            return { error: { message: "Network error during login." } };
        }
    },

    // ── Get Session ───────────────────────────────────────────────────────────
    getSession() {
        const user = getSession();
        return { data: { session: user ? { user } : null } };
    },

    // ── Sign Out ──────────────────────────────────────────────────────────────
    signOut() {
        setSession(null, null);
        localStorage.removeItem("userProfile");
        localStorage.removeItem("userProfileImage");
        localStorage.removeItem("role");
        localStorage.removeItem("loggedUser");
        sessionStorage.clear();
        // Also fire the global event for Navbar consistency
        window.dispatchEvent(new Event("usernameUpdated"));
        return { error: null };
    },

    // ── Auth State Change Listener ────────────────────────────────────────────
    onAuthStateChange(callback) {
        AUTH_CALLBACKS.push(callback);
        // Return unsubscribe handle (matches Supabase API shape)
        return {
            data: {
                subscription: {
                    unsubscribe() {
                        const idx = AUTH_CALLBACKS.indexOf(callback);
                        if (idx !== -1) AUTH_CALLBACKS.splice(idx, 1);
                    },
                },
            },
        };
    },

    // ── Update Username ───────────────────────────────────────────────────────
    updateUsername(userId, newUsername) {
        // Mock method to prevent crashes in UserProfile.jsx. 
        // Real profile updates would require a new backend route (e.g. PUT /api/users/:id)
        const session = getSession();
        if (session && session.id === userId) {
            setSession({ ...session, username: newUsername, name: newUsername }, localStorage.getItem(TOKEN_KEY));
        }
    },
};

// Keep a named export "supabase" as an alias so any file that still imports
// { supabase } will get localAuth without crashing.
export const supabase = localAuth;
