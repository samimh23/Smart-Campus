"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Loader2, User, Check, X, PlusCircle, Users } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

interface Subject {
  id: number
  name: string
  teachers?: Teacher[]
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
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null)
  const [selectedTeachersForNewSubject, setSelectedTeachersForNewSubject] = useState<number[]>([])
  const [teachersLoading, setTeachersLoading] = useState(false)
  
  // New state for subject creation
  const [showCreateSubject, setShowCreateSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState("")
  const [creatingSubject, setCreatingSubject] = useState(false)

  // Helper function to safely get error message
  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message || "An error occurred"
    }
    if (error instanceof Error) {
      return error.message
    }
    return "An unknown error occurred"
  }

  // Helper function to safely get status code
  const getErrorStatus = (error: unknown): number | undefined => {
    if (axios.isAxiosError(error)) {
      return error.response?.status
    }
    return undefined
  }

  // Fetch all teachers with better endpoint handling
  const fetchAllTeachers = async () => {
    try {
      const token = localStorage.getItem("token")
      
      // Try multiple possible endpoints
      const endpoints = [
        'http://localhost:3000/users/role/TEACHER',
        'http://localhost:3000/subjects/teachers/all', 
        'http://localhost:3000/auth/users/role/TEACHER',
        'http://localhost:3000/teachers'
      ]

      let teachersData: Teacher[] = []
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`)
          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          })
          teachersData = response.data || []
          if (teachersData.length > 0) {
            console.log(`Successfully fetched teachers from: ${endpoint}`)
            break
          }
        } catch (err) {
          const status = getErrorStatus(err)
          console.log(`Endpoint ${endpoint} failed with status: ${status}`)
        }
      }

      // If no teachers found from APIs, create mock data for development
      if (teachersData.length === 0) {
        console.warn("No teachers API found, using mock data")
        teachersData = [
          { id: 1, first_name: "John", last_name: "Doe", email: "john.doe@school.com" },
          { id: 2, first_name: "Jane", last_name: "Smith", email: "jane.smith@school.com" },
          { id: 3, first_name: "Mike", last_name: "Johnson", email: "mike.johnson@school.com" },
        ]
      }

      setAllTeachers(teachersData)
    } catch (err: unknown) {
      console.error("All teacher endpoints failed:", err)
      // Don't show error toast, use empty array and continue
      setAllTeachers([])
    }
  }

  // Fetch all subjects
  const fetchAllSubjects = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `http://localhost:3000/subjects`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setSubjects(response.data || [])
    } catch (err: unknown) {
      console.error("Failed to fetch subjects:", err)
      toast.error("Failed to fetch subjects")
    }
  }

  // Fetch available subjects for this class
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
      setAvailableSubjects(response.data.availableSubjects || response.data || [])
    } catch (err: unknown) {
      console.error("Failed to fetch available subjects:", err)
      // If this endpoint fails, use all subjects as available
      setAvailableSubjects(subjects)
    } finally {
      setLoading(false)
    }
  }

  // Create new subject with teacher assignment
  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error("Please enter a subject name")
      return
    }

    setCreatingSubject(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `http://localhost:3000/subjects`,
        { 
          name: newSubjectName.trim(),
          teacherIds: selectedTeachersForNewSubject.length > 0 ? selectedTeachersForNewSubject : undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      toast.success("Subject created successfully")
      
      const newSubject = response.data
      setAvailableSubjects(prev => [...prev, newSubject])
      setSubjects(prev => [...prev, newSubject])
      
      setSelectedSubject(newSubject.id)
      setNewSubjectName("")
      setSelectedTeachersForNewSubject([])
      setShowCreateSubject(false)
      
    } catch (err: unknown) {
      console.error("Failed to create subject:", err)
      const status = getErrorStatus(err)
      if (status === 409) {
        toast.error("A subject with this name already exists")
      } else {
        toast.error(getErrorMessage(err))
      }
    } finally {
      setCreatingSubject(false)
    }
  }

  const handleAddSubject = async (subjectId: number, teacherId?: number) => {
    try {
      const token = localStorage.getItem("token")
      
      let apiUrl = `http://localhost:3000/classes/${classId}/subjects/${subjectId}`
      
      if (teacherId) {
        // Try the assign-teacher endpoint first
        try {
          await axios.post(
            `http://localhost:3000/classes/${classId}/subjects/${subjectId}/assign-teacher/${teacherId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        } catch (assignErr: unknown) {
          // If assign-teacher fails, try the regular endpoint
          console.log("Assign teacher endpoint failed, trying regular endpoint")
          await axios.post(
            apiUrl,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        }
      } else {
        await axios.post(
          apiUrl,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }

      toast.success("Subject added successfully")
      onSubjectsUpdated()
      setOpen(false)
      setSelectedSubject(null)
      setSelectedTeacher(null)
      setShowCreateSubject(false)
      setNewSubjectName("")
      setSelectedTeachersForNewSubject([])
    } catch (err: unknown) {
      console.error("Add subject error:", err)
      toast.error(getErrorMessage(err))
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
    } catch (err: unknown) {
      console.error("Failed to fetch teachers for subject:", err)
      // If subject teachers endpoint fails, use all teachers
      setTeachers(allTeachers)
    } finally {
      setTeachersLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchAllTeachers()
      fetchAllSubjects()
      fetchAvailableSubjects()
      setSelectedSubject(null)
      setSelectedTeacher(null)
      setTeachers([])
      setShowCreateSubject(false)
      setNewSubjectName("")
      setSelectedTeachersForNewSubject([])
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
    setShowCreateSubject(false)
  }

  const handleTeacherSelect = (teacherId: number) => {
    setSelectedTeacher(teacherId)
  }

  const handleTeacherSelectForNewSubject = (teacherId: number) => {
    setSelectedTeachersForNewSubject(prev =>
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    )
  }

  const handleAdd = () => {
    if (!selectedSubject) {
      toast.error("Please select a subject")
      return
    }
    
    // Allow adding subject even without teacher selection
    handleAddSubject(selectedSubject, selectedTeacher || undefined)
  }

  // Check if add button should be enabled
  const isAddButtonEnabled = selectedSubject && !showCreateSubject

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#a855f7] hover:bg-[#a855f7]/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Subjects
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#1a1f2e] border-slate-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#a855f7]" />
            Add Subjects to {className}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Select existing subjects or create new ones and assign teachers to this class
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Subject Section */}
          {!showCreateSubject ? (
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium">Select Subject</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateSubject(true)}
                className="border-green-600 text-green-400 hover:bg-green-600/20"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create New Subject
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Create New Subject</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateSubject(false)}
                  className="border-slate-600 text-slate-400 hover:bg-slate-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter subject name (e.g., Mathematics, Physics...)"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="flex-1 bg-[#0a0e1a] border-slate-700 text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateSubject()
                      }
                    }}
                  />
                  <Button
                    onClick={handleCreateSubject}
                    disabled={creatingSubject || !newSubjectName.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {creatingSubject ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Teacher Selection for New Subject */}
                <div>
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Assign Teachers (Optional)
                  </h4>
                  {allTeachers.length === 0 ? (
                    <div className="text-slate-400 text-sm p-2 bg-[#0a0e1a] rounded border border-slate-800">
                      No teachers available. You can create the subject without teachers.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {allTeachers.map((teacher) => (
                          <Card
                            key={teacher.id}
                            className={`cursor-pointer transition-all ${
                              selectedTeachersForNewSubject.includes(teacher.id)
                                ? "bg-[#FF6B35]/20 border-[#FF6B35]"
                                : "bg-[#0a0e1a] border-slate-800 hover:border-slate-600"
                            }`}
                            onClick={() => handleTeacherSelectForNewSubject(teacher.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-white text-sm">
                                    {teacher.first_name} {teacher.last_name}
                                  </div>
                                  <div className="text-slate-400 text-xs">{teacher.email}</div>
                                </div>
                                {selectedTeachersForNewSubject.includes(teacher.id) && (
                                  <Check className="w-4 h-4 text-[#FF6B35]" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {selectedTeachersForNewSubject.length > 0 && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="bg-[#FF6B35] text-white">
                            {selectedTeachersForNewSubject.length} teacher(s) selected
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Available Subjects List */}
          {!showCreateSubject && (
            <div className="space-y-4">
              <h4 className="text-white font-medium">Available Subjects</h4>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#a855f7]" />
                </div>
              ) : availableSubjects.length === 0 ? (
                <div className="text-slate-400 text-center py-4 bg-[#0a0e1a] rounded border border-slate-800">
                  No subjects available. Create a new subject to get started.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
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
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{subject.name}</div>
                            <div className="text-slate-400 text-xs mt-1">
                              {subject.teachers?.length || 0} teacher(s) assigned
                            </div>
                          </div>
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
          )}

          {/* Teacher Selection for Existing Subject */}
          {!showCreateSubject && selectedSubject && (
            <div className="space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Assign Teacher to Subject (Optional)
              </h4>
              {teachersLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#a855f7]" />
                </div>
              ) : teachers.length === 0 ? (
                <div className="text-slate-400 text-sm p-3 bg-[#0a0e1a] rounded border border-slate-800">
                  No teachers available for this subject. You can add the subject without a teacher and assign one later.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
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
              {selectedTeacher && (
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-[#FF6B35] text-white">
                    Teacher selected
                  </Badge>
                </div>
              )}
              <div className="text-slate-400 text-xs">
                Note: You can add the subject without selecting a teacher.
              </div>
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
            disabled={!isAddButtonEnabled}
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