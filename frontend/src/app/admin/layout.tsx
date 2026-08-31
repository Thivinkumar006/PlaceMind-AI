"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  BarChart, 
  FileText, 
  Settings, 
  LogOut,
  ShieldCheck,
  Activity,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Placement Team", href: "/admin/team", icon: ShieldCheck },
  { name: "Companies", href: "/admin/companies", icon: Building2 },
  { name: "Placement Drives", href: "/admin/drives", icon: Briefcase },
  { name: "ATS & Matching", href: "/admin/ats", icon: Activity },
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout, role } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "PLACEMENT_LEAD"]}>
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex-shrink-0 flex flex-col">
          {/* Logo Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60">
            <Link href="/admin/dashboard" className="block">
              <div className="bg-white p-2.5 rounded-xl shadow-md flex items-center justify-center hover:opacity-95 transition-opacity">
                <img 
                  src="/rathinam-logo.png" 
                  alt="Rathinam Technical Campus Logo" 
                  className="h-10 w-auto object-contain max-w-full"
                />
              </div>
              <div className="mt-2.5 px-1 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Placement Portal
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                  Autonomous
                </span>
              </div>
            </Link>
          </div>

          <div className="flex-1 py-4 overflow-y-auto">
            <nav className="space-y-1 px-3">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive 
                        ? "bg-blue-600 text-white shadow-sm font-bold" 
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-800">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800" 
              onClick={logout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col bg-slate-50 min-w-0">
          <header className="h-16 flex items-center justify-between px-6 bg-white border-b sticky top-0 z-10 shadow-xs">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <img 
                  src="/rathinam-logo.png" 
                  alt="Rathinam Logo" 
                  className="h-9 w-auto object-contain hidden sm:block"
                />
                <div className="hidden md:block h-6 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-5 w-5 text-blue-600 hidden md:block" />
                  <span className="text-sm font-bold text-slate-900 hidden md:inline">
                    Placement & Training Portal
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {role === "ADMIN" ? "Admin Access" : role === "MANAGER" ? "Manager Access" : role === "PLACEMENT_LEAD" ? "Lead Access" : "User Access"}
              </span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                {role ? role.charAt(0) : "A"}
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
