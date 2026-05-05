import React, { createContext, useContext, useEffect, useState } from "react";
import { storage } from "@/utils/storage.js";

const USER_KEY = "smart_a_user";
const SESSION_KEY = "smart_a_session";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const session = await storage.get(SESSION_KEY);
      if (session) {
        const stored = await storage.get(USER_KEY);
        if (stored) setUser(stored);
      }
      setLoading(false);
    })();
  }, []);

  const register = async (data) => {
    const newUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      avatar: null,
    };
    await storage.set(USER_KEY, newUser);
    await storage.set(SESSION_KEY, true);
    setUser(newUser);
    return newUser;
  };

  const login = async (email, password, rememberMe = true) => {
    const stored = await storage.get(USER_KEY);
    if (!stored) throw new Error("No account found. Please register.");
    if (stored.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error("Invalid email or password.");
    }
    if (stored.password !== password) {
      throw new Error("Invalid email or password.");
    }
    await storage.setRemember(SESSION_KEY, true, rememberMe);
    setUser(stored);
    return stored;
  };

  const logout = async () => {
    await storage.remove(SESSION_KEY);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const updated = { ...user, ...data };
    await storage.set(USER_KEY, updated);
    setUser(updated);
  };

  const checkEmailExists = async (email) => {
    const stored = await storage.get(USER_KEY);
    if (!stored) throw new Error("No account found with that email.");
    if (stored.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error("No account found with that email.");
    }
    return true;
  };

  const resetPassword = async (email, newPassword) => {
    const stored = await storage.get(USER_KEY);
    if (!stored) throw new Error("No account found with that email.");
    if (stored.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error("No account found with that email.");
    }
    if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
    const updated = { ...stored, password: newPassword };
    await storage.set(USER_KEY, updated);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile, checkEmailExists, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
