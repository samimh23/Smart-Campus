"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Plus, Search, Loader2, AlertCircle } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
  username: string
  is_active: boolean
  classe_id?: number
}

interface AddStudentsDialogProps {
  classId: number
  className: string
  onStudentsAdded: () => void
}

export function AddStudentsDialog({ classId, className, onStudentsAdded }: AddStudentsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [availableStudents, setAvailableStudents] = useState<Student[]>([])
  const [currentStudents, setCurrentStudents] = useState<Student[]>([])
  const [currentStudentIds, setCurrentStudentIds] = useState<number[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  const fetchAvailableStudents = async () => {
    setLoadingStudents(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `http://localhost:3000/classes/${classId}/students/available`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      
      console.log('Available students response:', response.data) // Debug log
      
      const allStudents = response.data.availableStudents || []
      const currentStudents = response.data.currentStudents || []
      const currentStudentIds = response.data.currentStudentIds || []
      
      setAvailableStudents(allStudents)
      setCurrentStudents(currentStudents)
      setCurrentStudentIds(currentStudentIds)
      
    } catch (err: any) {
      console.error("Failed to fetch available students:", err)
      toast.error(err.response?.data?.message || "Failed to fetch students")
    } finally {
      setLoadingStudents(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchAvailableStudents()
      setSelectedStudents([])
      setSearchTerm("")
    }
  }, [open, classId])

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student")
      return
    }

    setIsLoading(true)
    
    try {
      const token = localStorage.getItem("token")
      
      const response = await axios.post(
        `http://localhost:3000/classes/${classId}/add-students`,
        {
          studentIds: selectedStudents
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      toast.success(response.data.message)
      setOpen(false)
      setSelectedStudents([])
      onStudentsAdded()
      
    } catch (err: any) {
      console.error("Add students error:", err)
      
      let errorMessage = "Failed to add students to class. Please try again."
      
      if (err?.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again."
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        window.location.href = "/"
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = availableStudents.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const selectAllStudents = () => {
    // Only select students that are available (not in this class and not in other classes)
    const availableStudentIds = filteredStudents
      .filter(student => 
        !currentStudentIds.includes(student.id) && 
        (!student.classe_id || student.classe_id === classId)
      )
      .map(student => student.id)
    
    if (selectedStudents.length === availableStudentIds.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(availableStudentIds)
    }
  }

  // Count available students (not in this class and not in other classes)
  const availableStudentCount = filteredStudents.filter(student => 
    !currentStudentIds.includes(student.id) && 
    (!student.classe_id || student.classe_id === classId)
  ).length

  // Count selected available students
  const selectedAvailableCount = selectedStudents.filter(id => {
    const student = availableStudents.find(s => s.id === id)
    return student && !currentStudentIds.includes(student.id) && (!student.classe_id || student.classe_id === classId)
  }).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#FF6B35] hover:bg-[#f97316] text-white">
          <Users className="w-4 h-4 mr-2" />
          Manage Students
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#1a1f2e] border-slate-800 h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-white">Manage Students - {className}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Add students to this class. Each student can only be in one class.
            {currentStudents.length > 0 && ` Current students: ${currentStudents.length}`}
          </DialogDescription>
        </DialogHeader>
        
        {/* Search and Info Section - Fixed at top */}
        <div className="flex-shrink-0 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search students by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#0a0e1a] border-slate-800/50 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Info Banner */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-400 font-medium">One Class Per Student</p>
                <p className="text-blue-300/80 text-xs mt-1">
                  Each student can only belong to one class. Students already in other classes cannot be selected.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Student List - Scrollable Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {loadingStudents ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-[#a855f7] mr-2" />
              <span className="text-slate-400">Loading students...</span>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="h-full flex flex-col">
              {/* Select All Header - Fixed */}
              <div className="flex-shrink-0 flex items-center space-x-2 p-4 border-b border-slate-800 bg-[#1a1f2e]">
                <Checkbox
                  checked={selectedAvailableCount > 0 && selectedAvailableCount === availableStudentCount}
                  onCheckedChange={selectAllStudents}
                  disabled={availableStudentCount === 0}
                  className="data-[state=checked]:bg-[#a855f7] border-slate-600"
                />
                <Label className="text-sm font-medium text-[#c084fc] cursor-pointer">
                  Select All Available ({availableStudentCount} students)
                </Label>
                <span className="text-xs text-slate-400 ml-auto">
                  {selectedStudents.length} selected
                </span>
              </div>

              {/* Scrollable Student List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {filteredStudents.map((student) => {
                    const isAlreadyInClass = currentStudentIds.includes(student.id)
                    const isInOtherClass = student.classe_id && student.classe_id !== classId
                    const isAvailable = !isAlreadyInClass && !isInOtherClass
                    
                    return (
                      <div
                        key={student.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          isAlreadyInClass 
                            ? 'bg-slate-800/30 opacity-70 cursor-not-allowed' 
                            : isInOtherClass
                            ? 'bg-amber-500/10 border border-amber-500/30 cursor-not-allowed'
                            : 'hover:bg-slate-800/50 cursor-pointer border border-transparent'
                        }`}
                        onClick={() => isAvailable && toggleStudentSelection(student.id)}
                      >
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => isAvailable && toggleStudentSelection(student.id)}
                          disabled={!isAvailable}
                          className="data-[state=checked]:bg-[#a855f7] border-slate-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-white truncate">
                              {student.first_name} {student.last_name}
                            </p>
                            {isAlreadyInClass && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-400/20 text-emerald-400 border border-emerald-400/30 whitespace-nowrap">
                                In This Class
                              </span>
                            )}
                            {isInOtherClass && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-400/20 text-amber-400 border border-amber-400/30 whitespace-nowrap">
                                In Another Class
                              </span>
                            )}
                            {!student.is_active && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-400/20 text-red-400 border border-red-400/30 whitespace-nowrap">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-1">
                            {student.email} • @{student.username}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">
                  {availableStudents.length === 0 && searchTerm === ""
                    ? "No students found in the system."
                    : "No students found matching your search."}
                </p>
                {availableStudents.length === 0 && (
                  <p className="text-sm text-slate-500 mt-1">
                    Create some student accounts first.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary and Footer - Fixed at bottom */}
        <div className="flex-shrink-0 space-y-4">
          {/* Summary */}
          <div className="bg-slate-800/30 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Total students in system:</span>
                <span className="text-white ml-2 font-medium">{availableStudents.length}</span>
              </div>
              <div>
                <span className="text-slate-400">Available for this class:</span>
                <span className="text-emerald-400 ml-2 font-medium">{availableStudentCount}</span>
              </div>
              <div>
                <span className="text-slate-400">In other classes:</span>
                <span className="text-amber-400 ml-2 font-medium">
                  {filteredStudents.filter(s => s.classe_id && s.classe_id !== classId).length}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Already in this class:</span>
                <span className="text-blue-400 ml-2 font-medium">
                  {filteredStudents.filter(s => currentStudentIds.includes(s.id)).length}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex justify-between items-center">
            <div className="text-sm text-slate-400">
              {selectedStudents.length} student(s) selected
            </div>
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStudents}
                disabled={isLoading || selectedStudents.length === 0}
                className="bg-gradient-to-r from-[#FF6B35] to-[#f97316] hover:from-[#f97316] hover:to-[#ea580c] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Selected Students
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}