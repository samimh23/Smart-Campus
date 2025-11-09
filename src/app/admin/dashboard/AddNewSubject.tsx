// app/admin/subjects/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, Plus, Edit, Trash2, Search, Loader2, Users } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

interface Subject {
  id: number
  name: string
  teachers?: Array<{
    id: number
    first_name: string
    last_name: string
    email: string
  }>
}

export default function SubjectsManagementPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [subjectName, setSubjectName] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:3000/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSubjects(response.data || [])
    } catch (err: any) {
      console.error("Failed to fetch subjects:", err)
      toast.error("Failed to fetch subjects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const handleSaveSubject = async () => {
    if (!subjectName.trim()) {
      toast.error("Please enter a subject name")
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      
      if (editingSubject) {
        // Update existing subject
        await axios.put(
          `http://localhost:3000/subjects/${editingSubject.id}`,
          { name: subjectName.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toast.success("Subject updated successfully")
      } else {
        // Create new subject
        await axios.post(
          "http://localhost:3000/subjects",
          { name: subjectName.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toast.success("Subject created successfully")
      }

      setDialogOpen(false)
      setEditingSubject(null)
      setSubjectName("")
      fetchSubjects()
    } catch (err: any) {
      console.error("Failed to save subject:", err)
      if (err.response?.status === 409) {
        toast.error("A subject with this name already exists")
      } else {
        toast.error(err.response?.data?.message || "Failed to save subject")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSubject = async (subjectId: number) => {
    if (!confirm("Are you sure you want to delete this subject? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:3000/subjects/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success("Subject deleted successfully")
      fetchSubjects()
    } catch (err: any) {
      console.error("Failed to delete subject:", err)
      toast.error(err.response?.data?.message || "Failed to delete subject")
    }
  }

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject)
    setSubjectName(subject.name)
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingSubject(null)
    setSubjectName("")
    setDialogOpen(true)
  }

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Subjects Management</h1>
          <p className="text-slate-400">Create and manage all subjects in the system</p>
        </div>

        {/* Actions Bar */}
        <Card className="bg-[#1a1f2e] border-slate-800 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#0a0e1a] border-slate-700 text-white"
                />
              </div>
              <Button onClick={openCreateDialog} className="bg-[#a855f7] hover:bg-[#a855f7]/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Subject
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Table */}
        <Card className="bg-[#1a1f2e] border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              All Subjects ({subjects.length})
            </CardTitle>
            <CardDescription className="text-slate-400">
              Manage subjects that can be assigned to classes and teachers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#a855f7] mr-2" />
                <span className="text-slate-400">Loading subjects...</span>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No subjects found</h3>
                <p className="text-slate-400 mb-4">
                  {searchTerm ? "No subjects match your search." : "Get started by creating your first subject."}
                </p>
                <Button onClick={openCreateDialog} className="bg-[#a855f7] hover:bg-[#a855f7]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Subject
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-slate-800">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Subject Name</TableHead>
                      <TableHead className="text-slate-400">Teachers</TableHead>
                      <TableHead className="text-slate-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects.map((subject) => (
                      <TableRow key={subject.id} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell className="font-medium text-white">
                          {subject.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {subject.teachers && subject.teachers.length > 0 ? (
                              subject.teachers.slice(0, 3).map((teacher) => (
                                <Badge key={teacher.id} variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                  {teacher.first_name} {teacher.last_name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-500 text-sm">No teachers assigned</span>
                            )}
                            {subject.teachers && subject.teachers.length > 3 && (
                              <Badge variant="outline" className="border-slate-600 text-slate-400">
                                +{subject.teachers.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(subject)}
                              className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSubject(subject.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1a1f2e] border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingSubject ? "Edit Subject" : "Create New Subject"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingSubject 
                ? "Update the subject name" 
                : "Add a new subject to the system"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-white">
                Subject Name
              </label>
              <Input
                id="name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Enter subject name (e.g., Mathematics, Physics...)"
                className="bg-[#0a0e1a] border-slate-700 text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveSubject()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSubject}
              disabled={saving || !subjectName.trim()}
              className="bg-[#a855f7] hover:bg-[#a855f7]/90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {editingSubject ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {editingSubject ? "Update Subject" : "Create Subject"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}