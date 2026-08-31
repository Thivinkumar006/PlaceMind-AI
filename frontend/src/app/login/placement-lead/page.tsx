"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Briefcase, ArrowLeft } from "lucide-react";

export default function PlacementLeadLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Email is required.");
      return;
    }
    
    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    // Mock Authentication
    setTimeout(() => {
      if (email.trim().toLowerCase() === "placementlead@placementportal.com" && password === "Lead@123") {
        login("PLACEMENT_LEAD");
        router.push("/admin/dashboard");
      } else {
        setError("Invalid email or password.");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-slate-900 text-white p-12">
        <div className="max-w-md space-y-6 text-center">
          <div className="bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-xl max-w-[280px]">
            <img 
              src="/rathinam-logo.png" 
              alt="Rathinam Technical Campus" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Placement Lead Portal</h1>
            <p className="text-blue-400 font-semibold text-xs mt-1">Rathinam Technical Campus (Autonomous)</p>
          </div>
          <p className="text-slate-300 text-sm">
            Coordinate recruiters, manage drive schedules, and track student placement outcomes.
          </p>
        </div>
      </div>

      {/* Right Side Login Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 bg-slate-50 relative">
        <Button variant="ghost" className="absolute top-8 left-8 text-slate-500" asChild>
          <Link href="/login">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Role Selection
          </Link>
        </Button>
        
        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardHeader className="space-y-2 px-0">
            <CardTitle className="text-3xl text-slate-900">Placement Lead Login</CardTitle>
            <CardDescription className="text-base text-slate-500">
              Enter your credentials to access the placement lead dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 mt-6">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="placementlead@placementportal.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-base" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
