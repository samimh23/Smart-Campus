"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Phone, Calendar, CheckCircle2, XCircle, Users } from "lucide-react"

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

interface StudentsViewProps {
  students: User[]
  loadingStudents: boolean
  activatingUsers: Set<string>
  toggleUserActivation: (userId: string, currentStatus: boolean, userRole: string) => void
  fetchStudents: () => void
}

export default function StudentsView({ 
  students, 
  loadingStudents, 
  activatingUsers, 
  toggleUserActivation,
  fetchStudents 
}: StudentsViewProps) {
  return (
    <Card className="bg-[#1a1f2e] border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Students Directory</CardTitle>
        <CardDescription className="text-slate-400">
          View and manage all students in the system ({students.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingStudents ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35]" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50 text-[#FF6B35]" />
            <p className="text-lg font-medium text-white">No students found</p>
            <p className="text-sm mt-2">Add your first student to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#FF6B35]">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#FF6B35]">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#FF6B35]">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#FF6B35]">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#FF6B35]">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#FF6B35]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#FF6B35]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-800/50 hover:bg-[#0a0e1a]/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#f97316] flex items-center justify-center text-white font-semibold">
                          {student.first_name.charAt(0)}
                          {student.last_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {student.first_name} {student.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 text-[#FF6B35]" />
                        <span className="text-sm">{student.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-4 h-4 text-[#FF6B35]" />
                        <span className="text-sm">{student.phone || "N/A"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30">
                        <Users className="w-3 h-3" />
                        Student
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {student.created_at ? new Date(student.created_at).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {student.is_active ? (
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
                        onClick={() => toggleUserActivation(student.id, student.is_active, student.role)}
                        disabled={activatingUsers.has(student.id)}
                        className={`text-xs ${
                          student.is_active
                            ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                            : "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                      >
                        {activatingUsers.has(student.id) ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : student.is_active ? (
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