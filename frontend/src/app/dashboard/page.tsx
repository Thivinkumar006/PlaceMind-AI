"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import useSWR from "swr"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { API_BASE_URL } from "@/lib/api"

const fetcher = (url: string) => fetch(url).then(r => r.json())
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DashboardPage() {
  const { logout, role } = useAuth();
  
  const { data, error, isLoading } = useSWR(`${API_BASE_URL}/dashboard/stats`, fetcher);
  
  return (
    <ProtectedRoute allowedRoles={["MANAGER", "PLACEMENT_LEAD"]}>
      <div className="flex flex-col flex-1 space-y-4 p-8 bg-slate-50 min-h-screen text-slate-900">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">
              Role: <span className="text-slate-900">{role}</span>
            </span>
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
            Failed to load dashboard data. Please make sure the backend is running.
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{data?.kpi_stats?.total_students || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Placed Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{data?.kpi_stats?.placed_students || 0}</div>
                  <p className="text-xs text-slate-500">{data?.kpi_stats?.placement_rate || 0}% Placement Rate</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{data?.kpi_stats?.total_companies || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Active Drives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{data?.kpi_stats?.active_drives || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900">Placement by Department</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.placement_data || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                          cursor={{fill: '#f8fafc'}}
                        />
                        <Legend wrapperStyle={{paddingTop: '20px'}} />
                        <Bar dataKey="total" name="Total Students" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="placed" name="Placed" fill="#0f172a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900">CTC Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data?.ctc_data || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(data?.ctc_data || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-7 bg-white border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900">Recent Placement Drives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {data?.recent_drives?.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4">No recent drives found.</p>
                    ) : (
                      (data?.recent_drives || []).map((drive: any, i: number) => (
                        <div key={i} className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-4"></div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none text-slate-900">{drive.company}</p>
                            <p className="text-sm text-slate-500">{drive.role}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-slate-900">{drive.status}</div>
                            <div className="text-xs text-slate-500">{drive.date}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}
