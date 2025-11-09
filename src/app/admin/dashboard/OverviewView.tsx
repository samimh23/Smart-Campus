"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  GraduationCap,
  BookOpen,
  UserPlus,
  TrendingUp,
  Activity,
  BarChart3,
  ArrowUpRight,
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

type View = "overview" | "teachers" | "students" | "classes" | "add-user" | "settings"

interface OverviewViewProps {
  setCurrentView: (view: View) => void
}

export default function OverviewView({ setCurrentView }: OverviewViewProps) {
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

      <style jsx>{`
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
      `}</style>
    </div>
  )
}