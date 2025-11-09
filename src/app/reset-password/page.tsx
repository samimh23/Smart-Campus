"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Lock, ArrowLeftCircle, Shield, CheckCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { resetPassword } from "@/app/api/services/auth"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isReset, setIsReset] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const otp = searchParams.get("otp") || ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords don't match!")
      return
    }
    setIsLoading(true)
    try {
      const response = await resetPassword(email, otp, password)
      console.log(response)
      if (response.success) {
        setIsReset(true)
      } else {
        alert(response.message)
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#a855f7] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-[#a855f7] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col space-y-6 p-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Smart Campus</h1>
              <p className="text-sm text-gray-400">Digital Learning Platform</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Reset Your Password</h2>
            <p className="text-gray-400 leading-relaxed">
              Enter a new password to secure your account. Make sure your password is strong and memorable.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/30">
              Secure Reset
            </Badge>
            <Badge variant="secondary" className="bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30">
              Encrypted
            </Badge>
          </div>

          <div className="space-y-3 mt-8">
            <div className="flex items-start space-x-3 p-4 bg-[#1e293b] rounded-lg border border-slate-700">
              <Shield className="w-5 h-5 text-[#a855f7] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-medium text-sm">Strong Encryption</h3>
                <p className="text-gray-400 text-xs mt-1">Your password is encrypted with industry-standard security</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-[#1e293b] rounded-lg border border-slate-700">
              <CheckCircle className="w-5 h-5 text-[#10b981] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-medium text-sm">Verified Reset</h3>
                <p className="text-gray-400 text-xs mt-1">Your identity has been verified through OTP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Reset Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border border-slate-700 bg-[#1e293b]">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center justify-center space-x-2 mb-4 lg:hidden">
                <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center shadow-md">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Smart Campus</h1>
              </div>
              <CardTitle className="text-2xl text-center text-white">Reset Password</CardTitle>
              <CardDescription className="text-center text-gray-400">Enter your new password below</CardDescription>
            </CardHeader>

            <CardContent>
              {!isReset ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-[#c084fc]">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter new password"
                        className="pl-10 bg-[#0f172a] border-slate-600 text-white placeholder:text-gray-500 focus:border-[#a855f7] focus:ring-[#a855f7]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-[#c084fc]">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        className="pl-10 bg-[#0f172a] border-slate-600 text-white placeholder:text-gray-500 focus:border-[#a855f7] focus:ring-[#a855f7]"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#FF6B35] hover:bg-[#f97316] text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-[#10b981] font-medium">
                    <CheckCircle className="w-5 h-5" />
                    <span>Password reset successfully!</span>
                  </div>
                  <Button
                    className="w-full bg-[#FF6B35] hover:bg-[#f97316] text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                    onClick={() => router.push("/auth")}
                  >
                    Go to Sign In
                  </Button>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-4 flex justify-center">
              <Button
                variant="link"
                className="text-sm text-[#a855f7] hover:text-[#c084fc] font-medium flex items-center space-x-1"
                onClick={() => router.back()}
              >
                <ArrowLeftCircle className="w-4 h-4" />
                <span>Back</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
