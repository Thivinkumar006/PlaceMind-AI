"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Users, Briefcase } from "lucide-react";

export default function RoleSelectionPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-slate-900 text-white p-12">
        <div className="max-w-md space-y-6 text-center">
          <div className="bg-blue-600 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-lg">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Placement Portal</h1>
          <p className="text-slate-300 text-lg">
            Streamlining campus placements with a modern, data-driven management system.
          </p>
        </div>
      </div>

      {/* Right Side Role Selection */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to Placement Portal</h2>
            <p className="text-slate-500">Select your role to continue</p>
          </div>

          <div className="grid gap-4 mt-8">
            <Card className="hover:border-blue-500 transition-colors group cursor-pointer" onClick={() => window.location.href = '/login/admin'}>
              <CardContent className="p-6 flex items-start space-x-4">
                <div className="bg-slate-100 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <ShieldCheck className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-slate-900">Admin Login</h3>
                  <p className="text-sm text-slate-500">Full access to placement management</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-blue-500 transition-colors group cursor-pointer" onClick={() => window.location.href = '/login/manager'}>
              <CardContent className="p-6 flex items-start space-x-4">
                <div className="bg-slate-100 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Users className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-slate-900">Manager Login</h3>
                  <p className="text-sm text-slate-500">Manage students, companies and placement activities</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-blue-500 transition-colors group cursor-pointer" onClick={() => window.location.href = '/login/placement-lead'}>
              <CardContent className="p-6 flex items-start space-x-4">
                <div className="bg-slate-100 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Briefcase className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-slate-900">Placement Lead Login</h3>
                  <p className="text-sm text-slate-500">Manage recruiters and placement drives</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
