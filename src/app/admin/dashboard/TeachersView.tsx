"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Phone, Calendar, CheckCircle2, XCircle, GraduationCap } from "lucide-react"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: number
  role: string
  created_at?: string
  is_active: boolean
}

interface TeachersViewProps {
  teachers: User[]
  loadingTeachers: boolean
  activatingUsers: Set<string>
  toggleUserActivation: (userId: string, currentStatus: boolean, userRole: string) => void
  fetchTeachers: () => void
}

export default function TeachersView({ 
  teachers, 
  loadingTeachers, 
  activatingUsers, 
  toggleUserActivation,
  fetchTeachers 
}: TeachersViewProps) {
  return (
    <Card className="bg-[#1a1f2e] border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Teachers Directory</CardTitle>
        <CardDescription className="text-slate-400">
          View and manage all teachers in the system ({teachers.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingTeachers ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#c084fc]" />
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50 text-[#c084fc]" />
            <p className="text-lg font-medium text-white">No teachers found</p>
            <p className="text-sm mt-2">Add your first teacher to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="border-b border-slate-800/50 hover:bg-[#0a0e1a]/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c084fc] to-[#a855f7] flex items-center justify-center text-white font-semibold">
                          {teacher.first_name.charAt(0)}
                          {teacher.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {teacher.first_name} {teacher.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 text-[#a855f7]" />
                        <span className="text-sm">{teacher.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-4 h-4 text-[#a855f7]" />
                        <span className="text-sm">{teacher.phone || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#c084fc]/20 text-[#c084fc] border border-[#c084fc]/30">
                        <GraduationCap className="w-3 h-3" />
                        Teacher
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {teacher.is_active ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleUserActivation(teacher.id, teacher.is_active, teacher.role)}
                        disabled={activatingUsers.has(teacher.id)}
                        className={`text-xs ${
                          teacher.is_active
                            ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                            : "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                      >
                        {activatingUsers.has(teacher.id) ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : teacher.is_active ? (
                          "Deactivate"
                        ) : (
                          "Activate"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}