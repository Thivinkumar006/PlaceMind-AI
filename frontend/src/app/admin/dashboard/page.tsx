"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const placementData = [
  { name: 'CSE', placed: 85, total: 100 },
  { name: 'IT', placed: 72, total: 90 },
  { name: 'ECE', placed: 64, total: 80 },
  { name: 'EEE', placed: 58, total: 85 },
];

const ctcData = [
  { name: '2-4 LPA', value: 120 },
  { name: '4-6 LPA', value: 85 },
  { name: '6-8 LPA', value: 50 },
  { name: '8-10 LPA', value: 20 },
  { name: '10+ LPA', value: 10 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h2>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">520</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">+20 from last year</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Placed Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">285</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">54.8% Placement Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">42</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">+5 new this week</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Drives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">7</div>
            <p className="text-xs text-slate-500 font-medium mt-1">3 ending soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Placement by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={placementData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="placed" name="Placed" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" name="Total Students" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">CTC Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ctcData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ctcData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Table (Mock) */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Recent Drives Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Selected</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">TCS</td>
                  <td className="px-4 py-3 text-slate-600">Software Engineer</td>
                  <td className="px-4 py-3 text-slate-600">15 Sep 2026</td>
                  <td className="px-4 py-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">WARM</span></td>
                  <td className="px-4 py-3 font-medium text-slate-900">35</td>
                </tr>
                <tr className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">Infosys</td>
                  <td className="px-4 py-3 text-slate-600">Systems Engineer</td>
                  <td className="px-4 py-3 text-slate-600">20 Sep 2026</td>
                  <td className="px-4 py-3"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">HOT</span></td>
                  <td className="px-4 py-3 font-medium text-slate-900">-</td>
                </tr>
                <tr className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">Wipro</td>
                  <td className="px-4 py-3 text-slate-600">Project Engineer</td>
                  <td className="px-4 py-3 text-slate-600">25 Sep 2026</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">COLD</span></td>
                  <td className="px-4 py-3 font-medium text-slate-900">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
