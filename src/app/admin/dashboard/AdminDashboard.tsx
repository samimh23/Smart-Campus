"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Sidebar from "./Sidebar"
import OverviewView from "./OverviewView"
import TeachersView from "./TeachersView"
import StudentsView from "./StudentsView"
import AddUserView from "./AddUserView"
import SettingsView from "./SettingsView"
import ClassesView from "./ClassesView"
import { Toaster, toast } from "sonner"

type View = "overview" | "teachers" | "students" | "classes" | "add-user" | "settings"

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

interface Subject {
  id: string
  name: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [currentView, setCurrentView] = useState<View>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // State for users and subjects
  const [teachers, setTeachers] = useState<User[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [activatingUsers, setActivatingUsers] = useState<Set<string>>(new Set())

  // Form state for AddUserView
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    username: "",
    role: "student",
    is_active: true,
    subjectIds: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "ADMIN") {
      router.push("/")
    } else {
      const storedEmail = localStorage.getItem("email")
      setEmail(storedEmail || "")
    }
  }, [router])

  useEffect(() => {
    if (currentView === "teachers") {
      fetchTeachers()
    }
  }, [currentView])

  useEffect(() => {
    if (currentView === "students") {
      fetchStudents()
    }
  }, [currentView])

  // Fetch subjects when role changes to teacher in form
  useEffect(() => {
    if (form.role === "teacher") {
      fetchSubjects()
    }
  }, [form.role])

  const fetchSubjects = async () => {
    setLoadingSubjects(true)
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:3000/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSubjects(res.data)
    } catch (err: any) {
      console.error("Failed to fetch subjects:", err)
      toast.error("Failed to load subjects")
    } finally {
      setLoadingSubjects(false)
    }
  }

  const fetchTeachers = async () => {
    setLoadingTeachers(true)
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:3000/auth/users/role/teacher", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTeachers(res.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch teachers")
    } finally {
      setLoadingTeachers(false)
    }
  }

  const fetchStudents = async () => {
    setLoadingStudents(true)
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:3000/auth/users/role/student", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStudents(res.data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch students")
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("email")
    router.push("/")
  }

  const toggleUserActivation = async (userId: string, currentStatus: boolean, userRole: string) => {
    if (activatingUsers.has(userId)) return;
    
    setActivatingUsers(prev => new Set(prev).add(userId));
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await axios.post(
        `http://localhost:3000/auth/admin/toggle-activation/${Number(userId)}`,
        { 
          activate: !currentStatus 
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000,
        }
      );

      toast.success(`User ${!currentStatus ? "activated" : "deactivated"} successfully!`);

      if (userRole.toLowerCase() === "teacher") {
        fetchTeachers();
      } else {
        fetchStudents();
      }

    } catch (err: any) {
      console.error("Toggle activation error:", err);

      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        toast.error("Network error: Cannot connect to server. Please check if backend is running.");
      } else if (err.response) {
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.error || 
                            `Server error: ${err.response.status}`;
        toast.error(errorMessage);
      } else {
        toast.error(`Unexpected error: ${err.message}`);
      }
    } finally {
      setActivatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setForm(prev => {
      const currentSubjects = [...prev.subjectIds];
      const subjectIndex = currentSubjects.indexOf(subjectId);
      
      if (subjectIndex > -1) {
        currentSubjects.splice(subjectIndex, 1);
      } else {
        if (currentSubjects.length < 3) {
          currentSubjects.push(subjectId);
        } else {
          toast.error("A teacher can have a maximum of 3 subjects");
        }
      }
      
      return { ...prev, subjectIds: currentSubjects };
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (!form.first_name || !form.last_name || !form.email || !form.username || !form.password) {
      toast.error("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (form.role === "teacher" && form.subjectIds.length === 0) {
      toast.error("Please select at least one subject for the teacher")
      setIsLoading(false)
      return
    }
    
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        toast.error("No authentication token found")
        return
      }
      
      const payload = {
        ...form,
        phone: form.phone ? Number(form.phone) : undefined,
        role: form.role.toLowerCase(),
        is_active: form.is_active,
        ...(form.role === "teacher" && { subjectIds: form.subjectIds })
      }
      
      const res = await axios.post("http://localhost:3000/auth/admin/create-user", payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })
      
      toast.success(`User ${res.data.userId} created successfully!`)
      
      setForm({ 
        first_name: "", 
        last_name: "", 
        email: "", 
        phone: "", 
        password: "", 
        username: "", 
        role: "student", 
        is_active: true,
        subjectIds: [] 
      })
      
      if (form.role === "teacher") {
        fetchTeachers()
      } else {
        fetchStudents()
      }
    } catch (err: any) {
      console.error("Create user error:", err)
      
      let errorMessage = "Failed to create user. Please try again."
      
      if (err?.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again."
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        router.push("/auth")
      } else if (err?.response?.status === 403) {
        errorMessage = "You don't have permission to create users."
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err?.response?.status === 400) {
        if (err?.response?.data?.message?.includes("already in use")) {
          errorMessage = "Email or phone number already exists. Please use different values."
        } else {
          errorMessage = "Invalid data provided. Please check all fields."
        }
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.code === 'NETWORK_ERROR' || err?.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      } else if (err?.code === 'TIMEOUT') {
        errorMessage = "Request timed out. Please try again."
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const renderView = () => {
  switch (currentView) {
    case "overview":
      return <OverviewView setCurrentView={setCurrentView} />
    case "teachers":
      return (
        <TeachersView 
          teachers={teachers}
          loadingTeachers={loadingTeachers}
          activatingUsers={activatingUsers}
          toggleUserActivation={toggleUserActivation}
          fetchTeachers={fetchTeachers}
        />
      )
    case "students":
      return (
        <StudentsView 
          students={students}
          loadingStudents={loadingStudents}
          activatingUsers={activatingUsers}
          toggleUserActivation={toggleUserActivation}
          fetchStudents={fetchStudents}
        />
      )
    case "classes":
      return <ClassesView />
    case "add-user":
      return (
        <AddUserView 
          form={form}
          setForm={setForm}
          isLoading={isLoading}
          subjects={subjects}
          loadingSubjects={loadingSubjects}
          handleSubjectChange={handleSubjectChange}
          handleCreateUser={handleCreateUser}
        />
      )
    case "settings":
      return <SettingsView email={email} />
    default:
      return <OverviewView setCurrentView={setCurrentView} />
      
  }
}

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            background: "#1a1f2e",
            color: "#FF6B35",
            border: "1px solid #334155",
          },
          className: "toast-notification",
        }}
      />
      <div className="flex min-h-screen bg-[#0a0e1a]">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          sidebarOpen={sidebarOpen}
          email={email}
          handleLogout={handleLogout}
        />
        <main className="flex-1 overflow-auto">
          <Header currentView={currentView} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="p-6">
            {renderView()}
          </div>
        </main>
      </div>
    </>
  )
}

// Header component
function Header({ currentView, sidebarOpen, setSidebarOpen }: { 
  currentView: View; 
  sidebarOpen: boolean; 
  setSidebarOpen: (open: boolean) => void 
}) {
  return (
    <header className="bg-[#1a1f2e] border-b border-slate-800 sticky top-0 z-10 shadow-lg">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg"
          >
            {sidebarOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {currentView === "overview" && "Dashboard Overview"}
              {currentView === "teachers" && "Teachers Management"}
              {currentView === "students" && "Students Management"}
              {currentView === "classes" && "Classes Management"}
              {currentView === "add-user" && "Add New User"}
              {currentView === "settings" && "Settings"}
            </h1>
            <p className="text-slate-400 mt-1">
              {currentView === "overview" && "Monitor your platform performance and statistics"}
              {currentView === "teachers" && "Manage and view all teachers in the system"}
              {currentView === "students" && "Manage and view all students in the system"}
              {currentView === "classes" && "Manage and view all classes in the system"}
              {currentView === "add-user" && "Create new teacher or student accounts"}
              {currentView === "settings" && "Configure your admin portal preferences"}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}