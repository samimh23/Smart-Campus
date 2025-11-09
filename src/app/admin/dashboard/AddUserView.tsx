"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, CheckCircle2, XCircle, Loader2, Users, GraduationCap } from "lucide-react"

interface Subject {
  id: string
  name: string
}

interface AddUserViewProps {
  form: {
    first_name: string
    last_name: string
    email: string
    phone: string
    password: string
    username: string
    role: string
    is_active: boolean
    subjectIds: string[]
  }
  setForm: React.Dispatch<React.SetStateAction<{
    first_name: string
    last_name: string
    email: string
    phone: string
    password: string
    username: string
    role: string
    is_active: boolean
    subjectIds: string[]
  }>>
  isLoading: boolean
  subjects: Subject[]
  loadingSubjects: boolean
  handleSubjectChange: (subjectId: string) => void // Add this line
  handleCreateUser: (e: React.FormEvent) => void
}

export default function AddUserView({ 
  form, 
  setForm, 
  isLoading, 
  subjects, 
  loadingSubjects, 
  handleCreateUser 
}: AddUserViewProps) {
  return (
    <Card className="max-w-2xl mx-auto bg-[#1a1f2e] border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Create New User</CardTitle>
        <CardDescription className="text-slate-400">
          Add a new teacher or student to the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleCreateUser}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-[#c084fc]">
                First Name
              </Label>
              <Input
                id="first_name"
                placeholder="John"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
                className="bg-[#0a0e1a] border-slate-800/50 text-white placeholder:text-gray-500 focus:border-[#a855f7]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-[#c084fc]">
                Last Name
              </Label>
              <Input
                id="last_name"
                placeholder="Doe"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
                className="bg-[#0a0e1a] border-slate-800/50 text-white placeholder:text-gray-500 focus:border-[#a855f7]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#c084fc]">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="bg-[#0a0e1a] border-slate-800/50 text-white placeholder:text-gray-500 focus:border-[#a855f7]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#c084fc]">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="bg-[#0a0e1a] border-slate-800/50 text-white placeholder:text-gray-500 focus:border-[#a855f7]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[#c084fc]">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="1234567890"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-[#0a0e1a] border-slate-800/50 text-white placeholder:text-gray-500 focus:border-[#a855f7]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#c084fc]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="bg-[#0a0e1a] border-slate-800/50 text-white placeholder:text-gray-500 focus:border-[#a855f7]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-[#c084fc]">
              User Role
            </Label>
            <Select 
              value={form.role} 
              onValueChange={(value) => setForm({ 
                ...form, 
                role: value,
                subjectIds: value === "teacher" ? form.subjectIds : []
              })}
            >
              <SelectTrigger id="role" className="bg-[#0a0e1a] border-slate-800/50 text-white">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f2e] border-slate-800/50">
                <SelectItem value="student" className="text-white focus:bg-purple-950/50 focus:text-white">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Student</span>
                  </div>
                </SelectItem>
                <SelectItem value="teacher" className="text-white focus:bg-purple-950/50 focus:text-white">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Teacher</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.role === "teacher" && (
            <div className="space-y-2">
              <Label htmlFor="subjects" className="text-[#c084fc]">
                Subjects (Max 3)
              </Label>
              <div className="space-y-3">
                {loadingSubjects ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-[#c084fc]" />
                    <span className="text-sm text-slate-400 ml-2">Loading subjects...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-800/50 rounded-lg bg-[#0a0e1a]/50 subjects-list">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`subject-${subject.id}`}
                          checked={form.subjectIds.includes(subject.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (form.subjectIds.length >= 3) {
                                return
                              }
                              setForm({ ...form, subjectIds: [...form.subjectIds, subject.id] })
                            } else {
                              setForm({ ...form, subjectIds: form.subjectIds.filter(id => id !== subject.id) })
                            }
                          }}
                          className="w-4 h-4 text-[#a855f7] border-slate-800/50 rounded focus:ring-[#a855f7] bg-[#0a0e1a]"
                        />
                        <Label 
                          htmlFor={`subject-${subject.id}`} 
                          className="text-sm text-slate-300 cursor-pointer flex-1"
                        >
                          {subject.name}
                        </Label>
                      </div>
                    ))}
                    {subjects.length === 0 && (
                      <div className="text-center py-4 text-slate-500 text-sm">
                        No subjects available
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Selected: {form.subjectIds.length}/3</span>
                  {form.subjectIds.length === 0 && form.role === "teacher" && (
                    <span className="text-amber-500">At least one subject is required for teachers</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="is_active" className="text-[#c084fc]">
              Account Status
            </Label>
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-800/50 bg-[#0a0e1a]/50">
              <div className="flex items-center gap-3">
                {form.is_active ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">
                    {form.is_active ? "Account Activated" : "Account Deactivated"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {form.is_active
                      ? "User can login immediately after creation"
                      : "User cannot login until activated"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className={`${
                  form.is_active
                    ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    : "border-red-500/50 text-red-400 hover:bg-red-500/10"
                }`}
              >
                {form.is_active ? "Activated" : "Deactivated"}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base bg-gradient-to-r from-[#FF6B35] to-[#f97316] hover:from-[#f97316] hover:to-[#ea580c] text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Creating User...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Create User
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}