"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Bell, 
  Settings2, 
  AlertTriangle,
  Camera,
  CheckCircle2,
  Globe,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";

// Custom UI Toggle Component for mockup
const Toggle = ({ enabled, setEnabled }: { enabled: boolean, setEnabled: (val: boolean) => void }) => (
  <div 
    onClick={() => setEnabled(!enabled)}
    className={cn(
      "w-12 h-6 rounded-full cursor-pointer transition-colors relative flex items-center",
      enabled ? "bg-blue-600" : "bg-slate-300"
    )}
  >
    <div className={cn(
      "w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform absolute left-0.5",
      enabled ? "translate-x-6" : "translate-x-0"
    )} />
  </div>
);

type SettingsTab = "profile" | "notifications" | "system" | "danger";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  
  // Mock State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "system", label: "System Config", icon: Settings2 },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your account and platform preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive 
                      ? (tab.danger ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700") 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? (tab.danger ? "text-red-600" : "text-blue-600") : "text-slate-400")} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          
          {/* PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Public Profile</CardTitle>
                  <CardDescription>This information will be displayed to students and companies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                        <User className="h-10 w-10 text-slate-400" />
                      </div>
                      <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-sm hover:bg-blue-700 transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Profile Photo</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs">We recommend an image of at least 300x300. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Full Name</label>
                      <Input defaultValue="Admin User" className="bg-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Email Address</label>
                      <Input defaultValue="admin@placement.edu" type="email" className="bg-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Phone Number</label>
                      <Input defaultValue="+91 98765 43210" className="bg-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Department / Title</label>
                      <Input defaultValue="Head of Placements" className="bg-white" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-4 px-6 flex justify-end">
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 w-32">
                    {isSaved ? <CheckCircle2 className="h-4 w-4 mr-2" /> : null}
                    {isSaved ? "Saved!" : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password associated with your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-w-md">
                    <label className="text-sm font-medium text-slate-700">Current Password</label>
                    <Input type="password" placeholder="••••••••" className="bg-white" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <label className="text-sm font-medium text-slate-700">New Password</label>
                    <Input type="password" placeholder="••••••••" className="bg-white" />
                  </div>
                  <div className="space-y-2 max-w-md">
                    <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                    <Input type="password" placeholder="••••••••" className="bg-white" />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-4 px-6 flex justify-end">
                  <Button variant="outline" className="bg-white">Update Password</Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* NOTIFICATIONS SETTINGS */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Communication Preferences</CardTitle>
                  <CardDescription>Decide how and when you receive platform alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Email Alerts</h4>
                      <p className="text-sm text-slate-500 mt-1 max-w-md">Receive an email when a new student applies for a drive or a company registers.</p>
                    </div>
                    <Toggle enabled={emailAlerts} setEnabled={setEmailAlerts} />
                  </div>
                  
                  <div className="h-px bg-slate-100 w-full" />

                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">SMS Notifications</h4>
                      <p className="text-sm text-slate-500 mt-1 max-w-md">Get text messages for critical alerts like upcoming placement drive reminders.</p>
                    </div>
                    <Toggle enabled={smsAlerts} setEnabled={setSmsAlerts} />
                  </div>

                  <div className="h-px bg-slate-100 w-full" />

                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Weekly Summary Reports</h4>
                      <p className="text-sm text-slate-500 mt-1 max-w-md">A detailed breakdown of all placement activity sent to your inbox every Friday.</p>
                    </div>
                    <Toggle enabled={weeklyReports} setEnabled={setWeeklyReports} />
                  </div>

                </CardContent>
                <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-4 px-6 flex justify-end">
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 w-32">
                    {isSaved ? <CheckCircle2 className="h-4 w-4 mr-2" /> : null}
                    {isSaved ? "Saved!" : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* SYSTEM CONFIGURATION */}
          {activeTab === "system" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Platform Configuration</CardTitle>
                  <CardDescription>Global settings that affect the entire placement portal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="space-y-2 max-w-md">
                    <label className="text-sm font-medium text-slate-700">Current Academic Year</label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2">
                      <option>2026-2027</option>
                      <option>2025-2026</option>
                      <option>2024-2025</option>
                    </select>
                  </div>

                  <div className="space-y-2 max-w-md">
                    <label className="text-sm font-medium text-slate-700">Default CGPA Cut-off (Optional)</label>
                    <Input type="number" defaultValue="7.0" className="bg-white" step="0.1" />
                    <p className="text-xs text-slate-500">This will be the default cut-off when creating a new drive.</p>
                  </div>

                  <div className="h-px bg-slate-100 w-full" />

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-700" />
                        <h4 className="text-sm font-semibold text-slate-900">Maintenance Mode</h4>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 max-w-md">When enabled, students will not be able to log in or submit applications. Admin access remains active.</p>
                    </div>
                    <Toggle enabled={maintenanceMode} setEnabled={setMaintenanceMode} />
                  </div>

                </CardContent>
                <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-4 px-6 flex justify-end">
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 w-32">
                    {isSaved ? <CheckCircle2 className="h-4 w-4 mr-2" /> : null}
                    {isSaved ? "Saved!" : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* DANGER ZONE */}
          {activeTab === "danger" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className="border-red-200 shadow-sm bg-red-50/20">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> Danger Zone
                  </CardTitle>
                  <CardDescription>Irreversible actions that affect the system database.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-red-200 rounded-lg bg-white">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Archive Previous Year Data</h4>
                      <p className="text-sm text-slate-500 mt-1 max-w-md">Move all current placement drives and student records to the read-only archive.</p>
                    </div>
                    <Button variant="outline" className="text-slate-700 border-slate-300 flex-shrink-0 bg-white">
                      <Database className="h-4 w-4 mr-2" /> Archive Data
                    </Button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-red-200 rounded-lg bg-white">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Factory Reset Portal</h4>
                      <p className="text-sm text-slate-500 mt-1 max-w-md">Permanently delete all drives, companies, and student records. This action cannot be undone.</p>
                    </div>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700 flex-shrink-0">
                      Delete All Data
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
