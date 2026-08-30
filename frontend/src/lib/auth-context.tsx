"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type Role = "ADMIN" | "MANAGER" | "PLACEMENT_LEAD" | null;

interface AuthContextType {
  role: Role;
  login: (newRole: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load role from localStorage on mount
    const storedRole = localStorage.getItem("placement_portal_role") as Role;
    if (storedRole) {
      setRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  const login = (newRole: Role) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem("placement_portal_role", newRole);
    }
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("placement_portal_role");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ role, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
