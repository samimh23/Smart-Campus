"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Loader2, User, Check } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

interface Subject {
  id: number
  name: string
}

interface Teacher {
  id: number
  first_name: string
  last_name: string
  email: string
}

interface AddSubjectsDialogProps {
  classId: number
  className: string
  onSubjectsUpdated: () => void
}

export function AddSubjectsDialog({ classId, className, onSubjectsUpdated }: AddSubjectsDialogProps) {
  const [open, setOpen] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null)
  const [teachersLoading, setTeachersLoading] = useState(false)

  // ✅ THIS IS WHERE YOU PUT THE FUNCTION - Replace your existing handleAddSubject
  const handleAddSubject = async (subjectId: number, teacherId?: number) => {
    try {
      const token = localStorage.getItem("token")
      
      if (teacherId) {
        // Use the new endpoint that assigns teacher to subject
        await axios.post(
          `http://localhost:3000/classes/${classId}/subjects/${subjectId}/assign-teacher/${teacherId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      } else {
        // Use the old endpoint just to add subject
        await axios.post(
          `http://localhost:3000/classes/${classId}/subjects/${subjectId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      }

      toast.success("Subject added successfully")
      onSubjectsUpdated()
      setOpen(false)
      // Reset selections
      setSelectedSubject(null)
      setSelectedTeacher(null)
    } catch (err: any) {
      console.error("Add subject error:", err)
      toast.error(err.response?.data?.message || "Failed to add subject")
    }
  }

  const fetchAvailableSubjects = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `http://localhost:3000/classes/${classId}/subjects/available`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setAvailableSubjects(response.data.availableSubjects || [])
    } catch (err: any) {
      console.error("Failed to fetch available subjects:", err)
      toast.error(err.response?.data?.message || "Failed to fetch subjects")
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachersForSubject = async (subjectId: number) => {
    setTeachersLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `http://localhost:3000/subjects/${subjectId}/teachers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setTeachers(response.data || [])
    } catch (err: any) {
      console.error("Failed to fetch teachers:", err)
      toast.error(err.response?.data?.message || "Failed to fetch teachers")
      setTeachers([])
    } finally {
      setTeachersLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchAvailableSubjects()
      setSelectedSubject(null)
      setSelectedTeacher(null)
      setTeachers([])
    }
  }, [open, classId])

  useEffect(() => {
    if (selectedSubject) {
      fetchTeachersForSubject(selectedSubject)
    } else {
      setTeachers([])
      setSelectedTeacher(null)
    }
  }, [selectedSubject])

  const handleSubjectSelect = (subjectId: number) => {
    setSelectedSubject(subjectId)
  }

  const handleTeacherSelect = (teacherId: number) => {
    setSelectedTeacher(teacherId)
  }

  const handleAdd = () => {
    if (!selectedSubject) {
      toast.error("Please select a subject")
      return
    }
    handleAddSubject(selectedSubject, selectedTeacher || undefined)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#a855f7] hover:bg-[#a855f7]/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Subjects
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1f2e] border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#a855f7]" />
            Add Subjects to {className}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Select subjects and assign teachers to this class
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subjects Selection */}
          <div>
            <h3 className="text-white font-medium mb-3">Select Subject</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#a855f7] mr-2" />
                <span className="text-slate-400">Loading subjects...</span>
              </div>
            ) : availableSubjects.length === 0 ? (
              <div className="text-center py-6 border border-slate-800 border-dashed rounded-lg">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">No available subjects to add.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {availableSubjects.map((subject) => (
                  <Card
                    key={subject.id}
                    className={`cursor-pointer transition-all ${
                      selectedSubject === subject.id
                        ? "bg-[#a855f7]/20 border-[#a855f7]"
                        : "bg-[#0a0e1a] border-slate-800 hover:border-slate-600"
                    }`}
                    onClick={() => handleSubjectSelect(subject.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{subject.name}</span>
                        {selectedSubject === subject.id && (
                          <Check className="w-4 h-4 text-[#a855f7]" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Teachers Selection - Only show if subject is selected */}
          {selectedSubject && (
            <div>
              <h3 className="text-white font-medium mb-3">Assign Teacher (Optional)</h3>
              {teachersLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-[#a855f7] mr-2" />
                  <span className="text-slate-400">Loading teachers...</span>
                </div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-4 border border-slate-800 border-dashed rounded-lg">
                  <User className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                  <p className="text-slate-400 text-sm">No teachers available for this subject</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {teachers.map((teacher) => (
                    <Card
                      key={teacher.id}
                      className={`cursor-pointer transition-all ${
                        selectedTeacher === teacher.id
                          ? "bg-[#FF6B35]/20 border-[#FF6B35]"
                          : "bg-[#0a0e1a] border-slate-800 hover:border-slate-600"
                      }`}
                      onClick={() => handleTeacherSelect(teacher.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm">
                              {teacher.first_name} {teacher.last_name}
                            </div>
                            <div className="text-slate-400 text-xs">{teacher.email}</div>
                          </div>
                          {selectedTeacher === teacher.id && (
                            <Check className="w-4 h-4 text-[#FF6B35]" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedSubject}
            className="bg-[#a855f7] hover:bg-[#a855f7]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}