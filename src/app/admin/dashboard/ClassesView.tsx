"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Calendar, Clock, MapPin, Plus, Loader2 } from "lucide-react"
import { AddClassDialog } from "./AddClassDialog"
import { AddStudentsDialog } from "./AddStudentsDialog"
import { ClassDetailsDialog } from "./ClassDetailsDialog" // Add this import
import axios from "axios"
import { toast } from "sonner"

interface Class {
  id: number
  name: string
  level?: string
  subjectCount?: number
  studentCount?: number
  subjects?: any[]
  students?: any[]
}

export default function ClassesView() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    totalStudents: 0,
    avgAttendance: "95%"
  })

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:3000/classes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const classesData = response.data


// In ClassesView.tsx - Add this after fetching classes
console.log('All classes data:', classesData)
classesData.forEach((classItem: Class, index: number) => {
  console.log(`Class ${index + 1}:`, classItem.name, 'Students:', classItem.students?.length || 0)
})


      setClasses(classesData)


      
      // Calculate statistics
      const totalStudents = classesData.reduce((total: number, classItem: Class) => 
        total + (classItem.students?.length || 0), 0
      )
      
      setStats({
        totalClasses: classesData.length,
        activeClasses: classesData.length,
        totalStudents,
        avgAttendance: "95%"
      })
      
    } catch (err: any) {
      console.error("Failed to fetch classes:", err)
      toast.error(err.response?.data?.message || "Failed to fetch classes")
    } finally {
      setLoading(false)
    }
  }
  

  useEffect(() => {
    fetchClasses()
  }, [])

  const handleClassCreated = () => {
    fetchClasses()
  }

  const handleStudentsUpdated = () => {
    fetchClasses() // Refresh to show updated student counts
  }

  const getStatusColor = (classItem: Class) => {
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  }

  const getStatusText = (classItem: Class) => {
    return "Active"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#a855f7]" />
        <span className="ml-2 text-white">Loading classes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Classes Management</h2>
          <p className="text-slate-400">Manage and view all classes in the system</p>
        </div>
        <AddClassDialog onClassCreated={handleClassCreated} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="bg-[#1a1f2e] border-slate-800 hover:border-[#a855f7]/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">{classItem.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {classItem.level || "No level specified"}
                  </CardDescription>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(classItem)}`}>
                  {getStatusText(classItem)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-slate-300">
                <BookOpen className="w-4 h-4 text-[#a855f7]" />
                <span className="text-sm">
                  Subjects: {classItem.subjects?.length || 0}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-[#a855f7]" />
                <span className="text-sm">
                  {classItem.students?.length || 0} students
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-[#a855f7]" />
                <span className="text-sm">Schedule: To be assigned</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-[#a855f7]" />
                <span className="text-sm">Room: To be assigned</span>
              </div>
              <div className="flex gap-2 pt-2">
                <ClassDetailsDialog
  classId={classItem.id}
  className={classItem.name}
  classLevel={classItem.level}
  classStudents={classItem.students || []}
  classSubjects={classItem.subjects || []}
  onStudentsUpdated={handleStudentsUpdated}
/>
                <AddStudentsDialog
                  classId={classItem.id}
                  className={classItem.name}
                  onStudentsAdded={handleStudentsUpdated}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        
        {classes.length === 0 && (
          <Card className="col-span-full bg-[#1a1f2e] border-slate-800 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="w-16 h-16 text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Classes Yet</h3>
              <p className="text-slate-400 text-center mb-6">
                Get started by creating your first class. Classes help you organize students and subjects.
              </p>
              <AddClassDialog onClassCreated={handleClassCreated} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Statistics Card */}
      <Card className="bg-[#1a1f2e] border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Class Statistics</CardTitle>
          <CardDescription className="text-slate-400">Overview of class performance and attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-[#0a0e1a]/50 border border-slate-800">
              <div className="text-2xl font-bold text-[#a855f7]">{stats.totalClasses}</div>
              <div className="text-sm text-slate-400">Total Classes</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-[#0a0e1a]/50 border border-slate-800">
              <div className="text-2xl font-bold text-emerald-400">{stats.activeClasses}</div>
              <div className="text-sm text-slate-400">Active Classes</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-[#0a0e1a]/50 border border-slate-800">
              <div className="text-2xl font-bold text-blue-400">{stats.totalStudents}</div>
              <div className="text-sm text-slate-400">Total Students</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-[#0a0e1a]/50 border border-slate-800">
              <div className="text-2xl font-bold text-[#FF6B35]">{stats.avgAttendance}</div>
              <div className="text-sm text-slate-400">Avg. Attendance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}