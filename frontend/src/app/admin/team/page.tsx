"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit2, Trash2, Mail, Phone, Shield } from "lucide-react";

// Mock data for the placement team
const MOCK_TEAM = [
  { id: 1, name: "Dr. Robert Chen", role: "Head of Placement", email: "robert.chen@university.edu", phone: "+1 (555) 123-4567", department: "University Administration", status: "Active" },
  { id: 2, name: "Sarah Jenkins", role: "Placement Coordinator", email: "s.jenkins@university.edu", phone: "+1 (555) 234-5678", department: "Computer Science", status: "Active" },
  { id: 3, name: "Michael Chang", role: "Industry Liaison", email: "m.chang@university.edu", phone: "+1 (555) 345-6789", department: "Engineering", status: "Active" },
  { id: 4, name: "Dr. Emily Rodriguez", role: "Placement Coordinator", email: "e.rodriguez@university.edu", phone: "+1 (555) 456-7890", department: "Business School", status: "On Leave" },
  { id: 5, name: "David Kim", role: "Student Advisor", email: "d.kim@university.edu", phone: "+1 (555) 567-8901", department: "Information Technology", status: "Active" },
  { id: 6, name: "Alex Thompson", role: "Manager", email: "a.thompson@university.edu", phone: "+1 (555) 678-9012", department: "Career Services", status: "Active" },
  { id: 7, name: "Lisa Patel", role: "Placement Lead", email: "l.patel@university.edu", phone: "+1 (555) 789-0123", department: "Engineering", status: "Active" },
];

export default function PlacementTeamPage() {
  const [search, setSearch] = useState("");
  const [team, setTeam] = useState(MOCK_TEAM);

  const filteredTeam = team.filter(member => 
    member.name.toLowerCase().includes(search.toLowerCase()) || 
    member.role.toLowerCase().includes(search.toLowerCase()) ||
    member.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Placement Team</h2>
        <div className="flex space-x-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Team Member
          </Button>
        </div>
      </div>

      <Card className="bg-white border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium text-slate-900 flex items-center">
              <Shield className="mr-2 h-5 w-5 text-blue-600" />
              Team Directory
            </CardTitle>
            <div className="flex flex-wrap items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search team members..."
                  className="w-[300px] pl-9 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-4 font-medium">Name & Role</th>
                  <th className="px-4 py-4 font-medium">Contact Information</th>
                  <th className="px-4 py-4 font-medium">Department</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeam.map((member) => (
                  <tr key={member.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{member.name}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{member.role}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-slate-600 text-xs">
                          <Mail className="h-3 w-3 mr-2 text-slate-400" />
                          {member.email}
                        </div>
                        <div className="flex items-center text-slate-600 text-xs">
                          <Phone className="h-3 w-3 mr-2 text-slate-400" />
                          {member.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{member.department}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTeam.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Shield className="h-10 w-10 text-slate-300 mb-3" />
                        <p className="text-base font-medium text-slate-900">No team members found</p>
                        <p className="text-sm">We couldn't find anyone matching your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
