"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!role) {
        // Not logged in
        router.push("/login");
      } else if (allowedRoles && !allowedRoles.includes(role)) {
        // Role not authorized, fallback based on role
        if (role === "ADMIN") router.push("/admin/dashboard");
        else router.push("/dashboard"); // Manager and Placement Lead fallback
      }
    }
  }, [role, isLoading, router, allowedRoles]);

  // Show a loading screen while checking auth
  if (isLoading || !role || (allowedRoles && !allowedRoles.includes(role))) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
