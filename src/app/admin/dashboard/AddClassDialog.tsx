"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

interface AddClassDialogProps {
  onClassCreated: () => void
}

export function AddClassDialog({ onClassCreated }: AddClassDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    level: ""
  })

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name.trim()) {
      toast.error("Class name is required")
      return
    }

    setIsLoading(true)
    
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        toast.error("No authentication token found")
        return
      }

      const response = await axios.post(
        "http://localhost:3000/classes",
        {
          name: form.name,
          level: form.level || undefined
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      toast.success(`Class "${response.data.name}" created successfully!`)
      setForm({ name: "", level: "" })
      setOpen(false)
      onClassCreated()
      
    } catch (err: any) {
      console.error("Create class error:", err)
      
      let errorMessage = "Failed to create class. Please try again."
      
      if (err?.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again."
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        window.location.href = "/"
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.code === 'NETWORK_ERROR' || err?.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#a855f7] to-[#9333ea] hover:from-[#9333ea] hover:to-[#7e22ce] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add New Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1f2e] border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Class</DialogTitle>
          <DialogDescription className="text-slate-400">
            Add a new class to the system. You can assign subjects and students later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateClass}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#c084fc]">
                Class Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Mathematics 101, Physics Advanced"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="bg-[#0a0e1a] border-slate-800/50 text-white placeholder:text-gray-500 focus:border-[#a855f7]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level" className="text-[#c084fc]">
                Level
              </Label>
              <Select 
                value={form.level} 
                onValueChange={(value) => setForm({ ...form, level: value })}
              >
                <SelectTrigger id="level" className="bg-[#0a0e1a] border-slate-800/50 text-white">
                  <SelectValue placeholder="Select level (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f2e] border-slate-800/50">
                  <SelectItem value="1st Year" className="text-white focus:bg-purple-950/50 focus:text-white">
                    1st Year
                  </SelectItem>
                  <SelectItem value="2nd Year" className="text-white focus:bg-purple-950/50 focus:text-white">
                    2nd Year
                  </SelectItem>
                  <SelectItem value="3rd Year" className="text-white focus:bg-purple-950/50 focus:text-white">
                    3rd Year
                  </SelectItem>
                  <SelectItem value="4th Year" className="text-white focus:bg-purple-950/50 focus:text-white">
                    4th Year
                  </SelectItem>
                  <SelectItem value="Advanced" className="text-white focus:bg-purple-950/50 focus:text-white">
                    Advanced
                  </SelectItem>
                  <SelectItem value="Beginner" className="text-white focus:bg-purple-950/50 focus:text-white">
                    Beginner
                  </SelectItem>
                  <SelectItem value="Intermediate" className="text-white focus:bg-purple-950/50 focus:text-white">
                    Intermediate
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-[#FF6B35] to-[#f97316] hover:from-[#f97316] hover:to-[#ea580c] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Class"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}