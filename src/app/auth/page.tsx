"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, GraduationCap, Mail, Lock, BookOpen, User, Building, Calendar, TrendingUp } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"

const coursesData = [{ value: 420 }, { value: 445 }, { value: 460 }, { value: 480 }, { value: 500 }]
const studentsData = [{ value: 8500 }, { value: 9200 }, { value: 9600 }, { value: 9900 }, { value: 10000 }]
const departmentsData = [{ value: 42 }, { value: 45 }, { value: 47 }, { value: 49 }, { value: 50 }]

export default function AuthPage() {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)

    const token = localStorage.getItem("token")
    localStorage.removeItem("role")
    if (token) {
      const userRole = localStorage.getItem("role")?.toUpperCase()
      if (userRole === "ADMIN") router.push("/admin/dashboard")
      else if (userRole === "TEACHER") router.push("/teacher/dashboard")
      else if (userRole === "STUDENT") router.push("/student/dashboard")
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation des champs
    if (!loginForm.email || !loginForm.password) {
      alert("Please fill in both email and password")
      setIsLoading(false)
      return
    }

    if (!loginForm.email.includes('@')) {
      alert("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      console.log("Attempting login with:", loginForm)
      console.log("Email:", loginForm.email)
      console.log("Password length:", loginForm.password.length)
      
      const response = await axios.post("http://localhost:3000/auth/login", loginForm, { 
        withCredentials: true,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 300; // default
        }
      })

      console.log("Login response:", response.data)
      const { token, user } = response.data
      console.log("Login success:", user)

      const userRole = user.role.toUpperCase()
      localStorage.setItem("token", token)
      localStorage.setItem("role", userRole)
      localStorage.setItem("email", user.email)
      localStorage.setItem("userId", user.id.toString())

      console.log("User role:", user.role, "Normalized:", userRole)

      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard")
          break
        case "teacher":
          router.push("/teacher/dashboard")
          break
        case "student":
          router.push("/student/dashboard")
          break
        default:
          console.error("Unknown user role:", user.role)
          alert(`Unknown user role: ${user.role}`)
      }
    } catch (err: any) {
      console.error("Login failed - Full error object:", err)
      console.error("Error type:", typeof err)
      console.error("Error keys:", Object.keys(err || {}))
      console.error("Error response:", err?.response)
      console.error("Error message:", err?.message)
      console.error("Error status:", err?.response?.status)
      console.error("Error data:", err?.response?.data)
      
      let errorMessage = "Login failed. Please try again."
      
      if (err?.response?.status === 401) {
        errorMessage = "Invalid email or password"
      } else if (err?.response?.status === 400) {
        errorMessage = "Invalid data provided"
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.code === 'NETWORK_ERROR' || err?.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if the backend is running."
      } else if (err?.code === 'TIMEOUT') {
        errorMessage = "Request timed out. Please try again."
      }
      
      console.error("Final error message:", errorMessage)
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div
        className={`w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        {/* Left Branding */}
        <div className="hidden lg:flex flex-col space-y-6 p-8">
          <div className="flex items-center space-x-3 animate-fade-in">
            <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-110">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Smart Campus</h1>
              <p className="text-sm text-gray-400">Digital Learning Platform</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Welcome to Your Smart Campus Experience</h2>
            <p className="text-gray-400 leading-relaxed">
              Connect, learn, and thrive in our digital campus ecosystem. Access courses, collaborate with peers, and
              manage your academic journey seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="stat-card-login group">
              <div className="flex items-start justify-between mb-2">
                <BookOpen className="w-8 h-8 text-[#a855f7] group-hover:scale-110 transition-transform duration-300" />
                <TrendingUp className="w-4 h-4 text-[#10b981]" />
              </div>
              <h3 className="font-semibold text-white text-lg">500+</h3>
              <p className="text-sm text-gray-400 mb-2">Courses Available</p>
              <ResponsiveContainer width="100%" height={30}>
                <LineChart data={coursesData}>
                  <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="stat-card-login group">
              <div className="flex items-start justify-between mb-2">
                <User className="w-8 h-8 text-[#FF6B35] group-hover:scale-110 transition-transform duration-300" />
                <TrendingUp className="w-4 h-4 text-[#10b981]" />
              </div>
              <h3 className="font-semibold text-white text-lg">10,000+</h3>
              <p className="text-sm text-gray-400 mb-2">Active Students</p>
              <ResponsiveContainer width="100%" height={30}>
                <LineChart data={studentsData}>
                  <Line type="monotone" dataKey="value" stroke="#FF6B35" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="stat-card-login group">
              <div className="flex items-start justify-between mb-2">
                <Building className="w-8 h-8 text-[#c084fc] group-hover:scale-110 transition-transform duration-300" />
                <TrendingUp className="w-4 h-4 text-[#10b981]" />
              </div>
              <h3 className="font-semibold text-white text-lg">50+</h3>
              <p className="text-sm text-gray-400 mb-2">Departments</p>
              <ResponsiveContainer width="100%" height={30}>
                <LineChart data={departmentsData}>
                  <Line type="monotone" dataKey="value" stroke="#c084fc" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="stat-card-login group">
              <div className="flex items-start justify-between mb-2">
                <Calendar className="w-8 h-8 text-[#10b981] group-hover:scale-110 transition-transform duration-300" />
                <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
              </div>
              <h3 className="font-semibold text-white text-lg">24/7</h3>
              <p className="text-sm text-gray-400 mb-2">Access Anytime</p>
              <div className="h-[30px] flex items-center">
                <div className="w-full bg-[#10b981]/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#10b981] to-[#22c55e] h-2 rounded-full animate-pulse"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Badge className="bg-[#a855f7]/20 text-[#c084fc] border-[#a855f7]/30 hover:bg-[#a855f7]/30 transition-colors">
              Secure Login
            </Badge>
            <Badge className="bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30 hover:bg-[#FF6B35]/30 transition-colors">
              SSL Encrypted
            </Badge>
            <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/30 transition-colors">
              GDPR Compliant
            </Badge>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border border-slate-700 bg-[#1e293b] backdrop-blur-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center justify-center space-x-2 mb-4 lg:hidden">
                <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center shadow-md">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Smart Campus</h1>
              </div>
              <CardTitle className="text-2xl text-center text-white">Welcome Back</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Sign in to your Smart Campus account
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-[#c084fc]">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-[#a855f7] transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@campus.edu"
                      className="pl-10 bg-[#0f172a] border-slate-600 text-white placeholder:text-gray-500 focus:border-[#a855f7] focus:ring-[#a855f7]/20 transition-all"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-[#c084fc]">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-[#a855f7] transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 bg-[#0f172a] border-slate-600 text-white placeholder:text-gray-500 focus:border-[#a855f7] focus:ring-[#a855f7]/20 transition-all"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-[#a855f7]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="remember" className="rounded bg-[#0f172a] border-slate-600" />
                    <Label htmlFor="remember" className="text-sm text-gray-400">
                      Remember me
                    </Label>
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm text-[#a855f7] hover:text-[#c084fc] font-medium"
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#FF6B35] hover:bg-[#f97316] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02] text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#1e293b] px-2 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full bg-[#0f172a] border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white hover:border-[#a855f7] transition-all"
                >
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-[#0f172a] border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white hover:border-[#a855f7] transition-all"
                >
                  GitHub
                </Button>
              </div>
            </CardContent>

            <CardFooter className="pt-4">
              <p className="text-center text-sm text-gray-400 w-full">
                Need help? Contact our{" "}
                <Button variant="link" className="p-0 h-auto text-sm text-[#a855f7] hover:text-[#c084fc] font-medium">
                  support team
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .stat-card-login {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
          animation: slideInUp 0.6s ease-out;
        }
        
        /* Removed hover transform effect from stat cards */
        .stat-card-login:hover {
          box-shadow: 0 10px 30px rgba(168, 85, 247, 0.2);
          border-color: #a855f7;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}
