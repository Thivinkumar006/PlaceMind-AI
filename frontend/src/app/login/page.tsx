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
          <div className="bg-white p-4 rounded-2xl mx-auto flex items-center justify-center shadow-xl border border-slate-700 max-w-[320px]">
            <img 
              src="/rathinam-logo.png" 
              alt="Rathinam Technical Campus" 
              className="h-14 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Placement Portal</h1>
            <p className="text-blue-400 font-semibold text-sm mt-1">Rathinam Technical Campus (Autonomous)</p>
          </div>
          <p className="text-slate-300 text-sm">
            Streamlining campus placement drives, student tracking, and automated ATS matching with a modern management system.
          </p>
        </div>
      </div>

      {/* Right Side Role Selection */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <div className="lg:hidden flex justify-center mb-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm inline-block">
                <img 
                  src="/rathinam-logo.png" 
                  alt="Rathinam Technical Campus" 
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
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
