"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast, Toaster } from "sonner"
import {
  Users,
  GraduationCap,
  BookOpen,
  UserPlus,
  LogOut,
  TrendingUp,
  Activity,
  BarChart3,
  Menu,
  X,
  ArrowUpRight,
  Settings,
  Mail,
  Calendar,
  Loader2,
  Phone,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

type View = "overview" | "teachers" | "students" | "add-user" | "settings"

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

export default function AdminDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [currentView, setCurrentView] = useState<View>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    username: "",
    role: "student",
    is_active: true,
  })
  const [isLoading, setIsLoading] = useState(false)

  const [teachers, setTeachers] = useState<User[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)

  const [activatingUsers, setActivatingUsers] = useState<Set<string>>(new Set())


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
  // Prevent multiple clicks on the same user
  if (activatingUsers.has(userId)) return;
  
  setActivatingUsers(prev => new Set(prev).add(userId));
  
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("No authentication token found");
      return;
    }

    console.log("🔄 Toggle activation request:", {
      userId,
      userIdAsNumber: Number(userId),
      currentStatus,
      newStatus: !currentStatus,
      userRole,
      tokenExists: !!token
    });

    // Convert userId to number to match backend expectation
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

    console.log("✅ Success response:", response.data);

    toast.success(`User ${!currentStatus ? "activated" : "deactivated"} successfully!`);

    // Refresh the appropriate list
    if (userRole.toLowerCase() === "teacher") {
      fetchTeachers();
    } else {
      fetchStudents();
    }

  } catch (err: any) {
    console.error("❌ Toggle activation error:", {
      name: err.name,
      message: err.message,
      code: err.code,
      response: err.response?.data,
      status: err.response?.status,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        data: err.config?.data,
      }
    });

    if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
      toast.error("Network error: Cannot connect to server. Please check if backend is running.");
    } else if (err.response) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          `Server error: ${err.response.status}`;
      toast.error(errorMessage);
      
      if (err.response.status === 401) {
        toast.error("Authentication failed. Please log in again.");
        handleLogout();
      }
    } else {
      toast.error(`Unexpected error: ${err.message}`);
    }
  } finally {
    // Remove user from loading set regardless of success/error
    setActivatingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }
};




  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Validation des champs requis
    if (!form.first_name || !form.last_name || !form.email || !form.username || !form.password) {
      toast.error("Please fill in all required fields")
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
        role: form.role.toLowerCase(), // Corriger : utiliser lowercase
        is_active: form.is_active,
      }
      
      console.log("Creating user with payload:", JSON.stringify(payload, null, 2))
      console.log("Token:", token ? "Present" : "Missing")
      console.log("Token content:", token ? token.substring(0, 50) + "..." : "No token")
      console.log("API URL:", "http://localhost:3000/auth/admin/create-user")
      console.log("Form data before processing:", form)
      
      // Vérifier le rôle de l'utilisateur connecté
      const userRole = localStorage.getItem("role")
      console.log("Current user role:", userRole)
      
      const res = await axios.post("http://localhost:3000/auth/admin/create-user", payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 secondes timeout
      })
      
      console.log("Response received:", res.data)
      toast.success(`User ${res.data.userId} created successfully!`)
      setForm({ first_name: "", last_name: "", email: "", phone: "", password: "", username: "", role: "student", is_active: true })
      if (form.role === "teacher") {
        fetchTeachers()
      } else {
        fetchStudents()
      }
    } catch (err: any) {
      console.error("Create user error - Full error object:", err)
      console.error("Error type:", typeof err)
      console.error("Error keys:", Object.keys(err || {}))
      console.error("Error response:", err?.response)
      console.error("Error message:", err?.message)
      console.error("Error status:", err?.response?.status)
      console.error("Error data:", err?.response?.data)
      
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
      
      console.error("Final error message:", errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const monthlyData = [
    { month: "Jan", students: 95, teachers: 12, courses: 28 },
    { month: "Feb", students: 102, teachers: 13, courses: 30 },
    { month: "Mar", students: 108, teachers: 14, courses: 32 },
    { month: "Apr", students: 112, teachers: 14, courses: 33 },
    { month: "May", students: 115, teachers: 15, courses: 34 },
    { month: "Jun", students: 120, teachers: 15, courses: 35 },
  ]

  const enrollmentData = [
    { name: "Enrolled", value: 94, color: "#10b981" },
    { name: "Pending", value: 6, color: "#a855f7" },
  ]

  const attendanceData = [
    { name: "Present", value: 87, color: "#10b981" },
    { name: "Absent", value: 13, color: "#ef4444" },
  ]

  const completionData = [
    { name: "Completed", value: 78, color: "#10b981" },
    { name: "In Progress", value: 22, color: "#f59e0b" },
  ]

  const stats = [
    {
      title: "Total Students",
      value: "120",
      change: "+12%",
      icon: Users,
      color: "text-[#a855f7]",
      bgColor: "bg-[#a855f7]/20",
      trend: [95, 98, 102, 105, 108, 112, 115, 120],
    },
    {
      title: "Total Teachers",
      value: "15",
      change: "+3%",
      icon: GraduationCap,
      color: "text-[#c084fc]",
      bgColor: "bg-[#c084fc]/20",
      trend: [12, 12, 13, 13, 14, 14, 15, 15],
    },
    {
      title: "Active Courses",
      value: "35",
      change: "+8%",
      icon: BookOpen,
      color: "text-[#FF6B35]",
      bgColor: "bg-[#FF6B35]/20",
      trend: [28, 29, 30, 31, 32, 33, 34, 35],
    },
    {
      title: "Enrollment Rate",
      value: "94%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      trend: [85, 87, 89, 90, 91, 92, 93, 94],
    },
    {
      title: "Avg. Attendance",
      value: "87%",
      change: "+2%",
      icon: Activity,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      trend: [82, 83, 84, 85, 85, 86, 86, 87],
    },
    {
      title: "Course Completion",
      value: "78%",
      change: "+6%",
      icon: BarChart3,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      trend: [68, 70, 72, 73, 75, 76, 77, 78],
    },
  ]

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

      <style jsx>{`
        /* Updated sidebar to match main background color */
        .sidebar-bg {
          background: #0a0e1a;
        }
        .sidebar-accent-bg {
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(255, 107, 53, 0.1) 100%);
        }
        .sidebar-accent-active {
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.3) 0%, rgba(249, 115, 22, 0.2) 100%);
          border-left: 3px solid #FF6B35;
        }
        /* Updated stat cards to medium dark background instead of dark gradient */
        .stat-card {
          transition: all 0.3s ease;
          background: #1e293b !important;
          border: 1px solid #334155 !important;
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -5px rgba(255, 107, 53, 0.3), 0 8px 10px -6px rgba(249, 115, 22, 0.2);
          border-color: #FF6B35 !important;
        }
        .stat-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #a855f7 0%, #FF6B35 50%, #10b981 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .stat-card:hover::before {
          opacity: 1;
        }
        :global(.toast-notification) {
          font-family: inherit;
        }
        :global([data-sonner-toast][data-type="success"]) {
          background: linear-gradient(135deg, #10b981 0%, #22c55e 100%) !important;
          color: white !important;
          border: none !important;
        }
        :global([data-sonner-toast][data-type="error"]) {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          color: white !important;
          border: none !important;
        }
      `}</style>

      <div className="flex min-h-screen bg-[#0a0e1a]">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 sidebar-bg flex flex-col overflow-hidden border-r border-slate-800`}
        >
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white">Admin Portal</h2>
            <p className="text-sm text-[#a855f7] mt-1">Learning Management</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setCurrentView("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === "overview" ? "sidebar-accent-active text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </button>

            <button
              onClick={() => setCurrentView("teachers")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === "teachers" ? "sidebar-accent-active text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span className="font-medium">Teachers</span>
            </button>

            <button
              onClick={() => setCurrentView("students")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === "students" ? "sidebar-accent-active text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Students</span>
            </button>

            <button
              onClick={() => setCurrentView("add-user")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === "add-user" ? "sidebar-accent-active text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-medium">Add User</span>
            </button>

            <button
              onClick={() => setCurrentView("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === "settings" ? "sidebar-accent-active text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 sidebar-accent-bg rounded-lg mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7] to-[#FF6B35] flex items-center justify-center text-white font-semibold">
                {email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{email || "Admin"}</p>
                <p className="text-xs text-[#a855f7]">Administrator</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-[#1a1f2e] border-b border-slate-800 sticky top-0 z-10 shadow-lg">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden text-white hover:bg-white/10"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {currentView === "overview" && "Dashboard Overview"}
                    {currentView === "teachers" && "Teachers Management"}
                    {currentView === "students" && "Students Management"}
                    {currentView === "add-user" && "Add New User"}
                    {currentView === "settings" && "Settings"}
                  </h1>
                  <p className="text-slate-400 mt-1">
                    {currentView === "overview" && "Monitor your platform performance and statistics"}
                    {currentView === "teachers" && "Manage and view all teachers in the system"}
                    {currentView === "students" && "Manage and view all students in the system"}
                    {currentView === "add-user" && "Create new teacher or student accounts"}
                    {currentView === "settings" && "Configure your admin portal preferences"}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-6">
            {currentView === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.map((stat, index) => (
                    <Card key={index} className="stat-card border-0">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className={`text-sm font-medium ${stat.color}`}>{stat.title}</CardTitle>
                        <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                              <ArrowUpRight className="w-3 h-3" />
                              {stat.change} from last month
                            </p>
                          </div>
                          <div className="w-24 h-12">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={stat.trend.map((value, i) => ({ value, index: i }))}>
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke={
                                    stat.color.includes("emerald")
                                      ? "#10b981"
                                      : stat.color.includes("FF6B35")
                                        ? "#FF6B35"
                                        : stat.color.includes("a855f7")
                                          ? "#a855f7"
                                          : "#c084fc"
                                  }
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Growth Trends Chart */}
                  <Card className="bg-[#1a1f2e] border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Growth Trends</CardTitle>
                      <CardDescription className="text-slate-400">Monthly growth across all categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={monthlyData}>
                          <defs>
                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorCourses" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="month" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1f2e",
                              border: "1px solid #a855f7",
                              borderRadius: "8px",
                              color: "#ffffff",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="students"
                            stroke="#a855f7"
                            fillOpacity={1}
                            fill="url(#colorStudents)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="teachers"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorTeachers)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="courses"
                            stroke="#FF6B35"
                            fillOpacity={1}
                            fill="url(#colorCourses)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <Card className="bg-[#1a1f2e] border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">Performance Metrics</CardTitle>
                      <CardDescription className="text-slate-400">Current system performance rates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-[#a855f7]">Enrollment Rate</span>
                            <span className="text-sm font-bold text-emerald-400">94%</span>
                          </div>
                          <div className="w-full h-3 bg-[#0a0e1a] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: "94%" }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-[#a855f7]">Average Attendance</span>
                            <span className="text-sm font-bold text-emerald-400">87%</span>
                          </div>
                          <div className="w-full h-3 bg-[#0a0e1a] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: "87%" }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-[#a855f7]">Course Completion</span>
                            <span className="text-sm font-bold text-emerald-400">78%</span>
                          </div>
                          <div className="w-full h-3 bg-[#0a0e1a] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: "78%" }}
                            />
                          </div>
                        </div>

                        {/* Pie Charts */}
                        <div className="grid grid-cols-3 gap-4 pt-4">
                          <div className="text-center">
                            <ResponsiveContainer width="100%" height={80}>
                              <PieChart>
                                <Pie
                                  data={enrollmentData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={20}
                                  outerRadius={35}
                                  dataKey="value"
                                >
                                  {enrollmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            <p className="text-xs text-slate-400 mt-1">Enrollment</p>
                          </div>
                          <div className="text-center">
                            <ResponsiveContainer width="100%" height={80}>
                              <PieChart>
                                <Pie
                                  data={attendanceData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={20}
                                  outerRadius={35}
                                  dataKey="value"
                                >
                                  {attendanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            <p className="text-xs text-slate-400 mt-1">Attendance</p>
                          </div>
                          <div className="text-center">
                            <ResponsiveContainer width="100%" height={80}>
                              <PieChart>
                                <Pie
                                  data={completionData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={20}
                                  outerRadius={35}
                                  dataKey="value"
                                >
                                  {completionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            <p className="text-xs text-slate-400 mt-1">Completion</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="bg-[#1a1f2e] border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                    <CardDescription className="text-slate-400">Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => setCurrentView("add-user")}
                      className="h-auto py-6 flex flex-col gap-2 bg-gradient-to-br from-[#a855f7] to-[#9333ea] hover:from-[#9333ea] hover:to-[#7e22ce] text-white"
                    >
                      <UserPlus className="w-6 h-6" />
                      <span>Add New User</span>
                    </Button>
                    <Button
                      onClick={() => setCurrentView("teachers")}
                      variant="outline"
                      className="h-auto py-6 flex flex-col gap-2 border border-purple-700 text-[#c084fc] hover:bg-purple-950/50 bg-transparent"
                    >
                      <GraduationCap className="w-6 h-6" />
                      <span>View Teachers</span>
                    </Button>
                    <Button
                      onClick={() => setCurrentView("students")}
                      variant="outline"
                      className="h-auto py-6 flex flex-col gap-2 border border-orange-700 text-[#FF6B35] hover:bg-orange-950/50 bg-transparent"
                    >
                      <Users className="w-6 h-6" />
                      <span>View Students</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentView === "teachers" && (
              <Card className="bg-[#1a1f2e] border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Teachers Directory</CardTitle>
                  <CardDescription className="text-slate-400">
                    View and manage all teachers in the system ({teachers.length} total)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingTeachers ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c084fc]" />
                    </div>
                  ) : teachers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50 text-[#c084fc]" />
                      <p className="text-lg font-medium text-white">No teachers found</p>
                      <p className="text-sm mt-2">Add your first teacher to get started</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-800">
                            <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Name</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Email</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Phone</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Role</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Joined</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[#c084fc]">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teachers.map((teacher) => (
                            <tr
                              key={teacher.id}
                              className="border-b border-slate-800/50 hover:bg-[#0a0e1a]/50 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c084fc] to-[#a855f7] flex items-center justify-center text-white font-semibold">
                                    {teacher.first_name.charAt(0)}
                                    {teacher.last_name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">
                                      {teacher.first_name} {teacher.last_name}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2 text-slate-300">
                                  <Mail className="w-4 h-4 text-[#a855f7]" />
                                  <span className="text-sm">{teacher.email}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2 text-slate-300">
                                  <Phone className="w-4 h-4 text-[#a855f7]" />
                                  <span className="text-sm">{teacher.phone || "N/A"}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#c084fc]/20 text-[#c084fc] border border-[#c084fc]/30">
                                  <GraduationCap className="w-3 h-3" />
                                  Teacher
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-sm">
                                    {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : "N/A"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
  {teacher.is_active ? (
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
    onClick={() => toggleUserActivation(teacher.id, teacher.is_active, teacher.role)}
    disabled={activatingUsers.has(teacher.id)}
    className={`text-xs ${
      teacher.is_active
        ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
        : "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
    }`}
  >
    {activatingUsers.has(teacher.id) ? (
      <Loader2 className="w-3 h-3 animate-spin" />
    ) : teacher.is_active ? (
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
            )}

            {currentView === "students" && (
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
                                  className={`text-xs ${
                                    student.is_active
                                      ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                                      : "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                                  }`}
                                >
                                  {student.is_active ? "Deactivate" : "Activate"}
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
            )}

            {currentView === "add-user" && (
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
                      <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
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
            )}

            {currentView === "settings" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <Card className="bg-[#1a1f2e] border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">General Settings</CardTitle>
                    <CardDescription className="text-slate-400">Manage your admin portal preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="platform-name" className="text-slate-300">
                        Platform Name
                      </Label>
                      <Input
                        id="platform-name"
                        placeholder="Learning Management System"
                        defaultValue="Learning Management System"
                        className="bg-[#0a0e1a] border-slate-800/50 text-white placeholder:text-gray-500 focus:border-[#a855f7]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-email" className="text-slate-300">
                        Admin Email
                      </Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-[#0a0e1a]/50 border-slate-800/50 text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Notifications</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800/50 bg-[#0a0e1a]/50">
                          <div>
                            <p className="text-sm font-medium text-white">Email Notifications</p>
                            <p className="text-xs text-slate-400">Receive email updates for new users</p>
                          </div>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-4 h-4 text-[#a855f7] border-slate-800/50 rounded focus:ring-[#a855f7] bg-[#0a0e1a]"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800/50 bg-[#0a0e1a]/50">
                          <div>
                            <p className="text-sm font-medium text-white">Success Notifications</p>
                            <p className="text-xs text-slate-400">Show toast notifications for successful actions</p>
                          </div>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-4 h-4 text-[#a855f7] border-slate-800/50 rounded focus:ring-[#a855f7] bg-[#0a0e1a]"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1f2e] border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Security</CardTitle>
                    <CardDescription className="text-slate-400">Manage your security preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-800/50 text-slate-300 hover:bg-purple-950/50 bg-transparent"
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-800/50 text-slate-300 hover:bg-purple-950/50 bg-transparent"
                    >
                      Two-Factor Authentication
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-800/50 text-slate-300 hover:bg-purple-950/50 bg-transparent"
                    >
                      Session Management
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#1a1f2e] border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">About</CardTitle>
                    <CardDescription className="text-slate-400">System information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-sm text-slate-400">Version</span>
                      <span className="text-sm font-medium text-white">1.0.0</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-sm text-slate-400">Last Updated</span>
                      <span className="text-sm font-medium text-white">January 2025</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-slate-400">Environment</span>
                      <span className="text-sm font-medium text-white">Production</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
