import { createContext, useContext, useEffect, useState } from "react";
import { registerRequest, loginRequest, getMeRequest } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "loading" covers the initial check for an existing token on page load,
  // so the UI can avoid flashing a login screen before that check finishes.
  const [loading, setLoading] = useState(true);

  // On first load, if a token is already saved, verify it and restore the
  // session by fetching the current user's profile.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    getMeRequest()
      .then((fetchedUser) => setUser(fetchedUser))
      .catch(() => {
        // Token invalid/expired — clear it so the app doesn't retry forever.
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { user: loggedInUser, token } = await loginRequest(email, password);
    localStorage.setItem("token", token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (formData) => {
    const { user: newUser, token } = await registerRequest(formData);
    localStorage.setItem("token", token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Lets components (Profile, ModeSwitch) sync local auth state after a
  // successful update, without needing to refetch /auth/me.
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Convenience hook so components can just call useAuth() instead of
// importing both useContext and AuthContext everywhere.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
