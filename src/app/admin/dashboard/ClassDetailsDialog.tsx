"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Users, Calendar, Clock, MapPin, Trash2, Eye, Plus, Loader2 } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import { AddSubjectsDialog } from "./AddSubjectsDialog"
import { AddStudentsDialog } from "./AddStudentsDialog"

interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
  username: string
  is_active: boolean
}

interface EnhancedSubject {
  id: number
  name: string
  assignedTeacher?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
}

interface ClassDetails {
  id: number
  name: string
  level?: string
  subjects?: EnhancedSubject[]
  students?: Student[]
  created_at?: string
}

interface ClassDetailsDialogProps {
  classId: number
  className: string
  classLevel?: string
  classStudents?: Student[]
  classSubjects?: any[]
  onStudentsUpdated: () => void
}

export function ClassDetailsDialog({ 
  classId, 
  className, 
  classLevel, 
  classStudents = [], 
  classSubjects = [], 
  onStudentsUpdated 
}: ClassDetailsDialogProps) {
  const [open, setOpen] = useState(false)
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [deletingStudent, setDeletingStudent] = useState<number | null>(null)

  const fetchClassDetails = async () => {
    if (!open) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      // Try the enhanced endpoint first
      const response = await axios.get(
        `http://localhost:3000/classes/${classId}/with-teachers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      console.log('Enhanced class details:', response.data)
      setClassDetails(response.data)
      
    } catch (err: any) {
      console.error("Failed to fetch enhanced class details:", err)
      // Fallback to basic endpoint
      try {
        const token = localStorage.getItem("token")
        const basicResponse = await axios.get(
          `http://localhost:3000/classes/${classId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setClassDetails(basicResponse.data)
      } catch (fallbackErr) {
        toast.error("Failed to fetch class details")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      // Use the passed data initially, then fetch fresh data
      setClassDetails({
        id: classId,
        name: className,
        level: classLevel,
        students: classStudents,
        subjects: classSubjects
      })
      
      // Then fetch the latest data from the server
      fetchClassDetails()
    }
  }, [open, classId, className, classLevel, classStudents, classSubjects])

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm("Are you sure you want to remove this student from the class?")) {
      return
    }

    setDeletingStudent(studentId)
    try {
      const token = localStorage.getItem("token")
      
      await axios.delete(
        `http://localhost:3000/classes/${classId}/students/${studentId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      toast.success("Student removed from class successfully")
      fetchClassDetails()
      onStudentsUpdated()
      
    } catch (err: any) {
      console.error("Remove student error:", err)
      toast.error(err.response?.data?.message || "Failed to remove student")
    } finally {
      setDeletingStudent(null)
    }
  }

  const handleRemoveSubject = async (subjectId: number) => {
    if (!confirm("Are you sure you want to remove this subject from the class?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      
      await axios.delete(
        `http://localhost:3000/classes/${classId}/subjects/${subjectId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      toast.success("Subject removed from class successfully")
      fetchClassDetails()
      onStudentsUpdated()
      
    } catch (err: any) {
      console.error("Remove subject error:", err)
      toast.error(err.response?.data?.message || "Failed to remove subject")
    }
  }

  const handleStudentsAdded = () => {
    fetchClassDetails()
    onStudentsUpdated()
  }

  const handleSubjectsUpdated = () => {
    fetchClassDetails()
    onStudentsUpdated()
  }

  // Use the classDetails data if available, otherwise use the passed props
  const currentClassDetails = classDetails || {
    id: classId,
    name: className,
    level: classLevel,
    students: classStudents,
    subjects: classSubjects
  }

  const students = currentClassDetails.students || []
  const subjects = currentClassDetails.subjects || []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] bg-[#1a1f2e] border-slate-800 max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#a855f7]" />
            Class Details - {currentClassDetails.name}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Manage class information, students, and subjects
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#a855f7] mr-2" />
              <span className="text-slate-400">Loading class details...</span>
            </div>
          ) : (
            <>
              {/* Class Information */}
              <Card className="bg-[#0a0e1a] border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center justify-between">
                    <span>Class Information</span>
                    <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#c084fc]">Class Name</label>
                      <p className="text-white text-lg font-semibold">{currentClassDetails.name}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#c084fc]">Level</label>
                      <p className="text-white">
                        {currentClassDetails.level || <span className="text-slate-500">Not specified</span>}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#c084fc]">Total Students</label>
                      <p className="text-white text-xl font-bold">
                        {students.length}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#c084fc]">Subjects</label>
                      <p className="text-white">
                        {subjects.length} subjects
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Students Management */}
              <Card className="bg-[#0a0e1a] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#a855f7]" />
                      Students ({students.length})
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Manage students enrolled in this class
                    </CardDescription>
                  </div>
                  <AddStudentsDialog
                    classId={classId}
                    className={currentClassDetails.name}
                    onStudentsAdded={handleStudentsAdded}
                  />
                </CardHeader>
                <CardContent>
                  {students.length > 0 ? (
                    <div className="border border-slate-800 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-900/50">
                          <TableRow className="border-slate-800">
                            <TableHead className="text-[#c084fc]">Student</TableHead>
                            <TableHead className="text-[#c084fc]">Email</TableHead>
                            <TableHead className="text-[#c084fc]">Username</TableHead>
                            <TableHead className="text-[#c084fc]">Status</TableHead>
                            <TableHead className="text-[#c084fc] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student) => (
                            <TableRow key={student.id} className="border-slate-800 hover:bg-slate-800/50">
                              <TableCell className="font-medium text-white">
                                {student.first_name} {student.last_name}
                              </TableCell>
                              <TableCell className="text-slate-300">{student.email}</TableCell>
                              <TableCell className="text-slate-300">@{student.username}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    student.is_active 
                                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                      : "bg-red-500/20 text-red-400 border-red-500/30"
                                  }
                                >
                                  {student.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveStudent(student.id)}
                                  disabled={deletingStudent === student.id}
                                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                >
                                  {deletingStudent === student.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-slate-800 border-dashed rounded-lg">
                      <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-white mb-2">No Students Yet</h3>
                      <p className="text-slate-400 mb-4">
                        Add students to this class to get started with management.
                      </p>
                      <AddStudentsDialog
                        classId={classId}
                        className={currentClassDetails.name}
                        onStudentsAdded={handleStudentsAdded}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subjects Section */}
              <Card className="bg-[#0a0e1a] border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#a855f7]" />
                      Subjects ({subjects.length})
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Subjects assigned to this class with their teachers
                    </CardDescription>
                  </div>
                  <AddSubjectsDialog
                    classId={classId}
                    className={currentClassDetails.name}
                    onSubjectsUpdated={handleSubjectsUpdated}
                  />
                </CardHeader>
                <CardContent>
                  {subjects.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {(subjects as EnhancedSubject[]).map((subject) => (
                          <div key={subject.id} className="relative group">
                            <Badge 
                              variant="outline"
                              className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-3 py-2 pr-8"
                            >
                              <div className="text-center">
                                <div className="font-semibold">{subject.name}</div>
                                {subject.assignedTeacher && (
                                  <div className="text-xs text-purple-300 mt-1">
                                    Teacher: {subject.assignedTeacher.first_name} {subject.assignedTeacher.last_name}
                                  </div>
                                )}
                                {!subject.assignedTeacher && (
                                  <div className="text-xs text-yellow-300 mt-1">
                                    No teacher assigned
                                  </div>
                                )}
                              </div>
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveSubject(subject.id)}
                              className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-slate-800 border-dashed rounded-lg">
                      <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400">No subjects assigned to this class yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}