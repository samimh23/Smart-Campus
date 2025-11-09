"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Mail, ArrowLeftCircle, Shield, Clock } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { verifyOtp } from "@/app/api/services/auth"

export default function OTPPage() {
  const searchParams = useSearchParams()
  const emailFromQuery = searchParams.get("email") || ""
  const router = useRouter()

  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await verifyOtp(emailFromQuery, otp)
      console.log(response)
      if (response.success) {
        setIsVerified(true)
        router.push(`/reset-password?email=${encodeURIComponent(emailFromQuery)}&otp=${encodeURIComponent(otp)}`)
      } else {
        alert(response.message)
      }
    } catch (err) {
      console.error(err)
      alert("Invalid OTP or something went wrong!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#a855f7] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-[#a855f7] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
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
            <h2 className="text-2xl font-semibold text-white">Verify Your Account</h2>
            <p className="text-gray-400 leading-relaxed">
              Enter the One-Time Password (OTP) sent to your email to securely reset your password.
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-start space-x-3 p-4 bg-[#1e293b] rounded-lg border border-slate-700">
              <div className="w-10 h-10 bg-[#a855f7]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-[#a855f7]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Secure Verification</h3>
                <p className="text-gray-400 text-sm">Your account security is our top priority</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-[#1e293b] rounded-lg border border-slate-700">
              <div className="w-10 h-10 bg-[#FF6B35]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Time-Limited Code</h3>
                <p className="text-gray-400 text-sm">OTP expires in 10 minutes for security</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className="bg-[#a855f7]/20 text-[#c084fc] border-[#a855f7]/30">Secure Verification</Badge>
            <Badge className="bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30">Email OTP</Badge>
          </div>
        </div>

        {/* Right Side - OTP Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border border-slate-700 bg-[#1e293b]">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center justify-center space-x-2 mb-4 lg:hidden">
                <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center shadow-md">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Smart Campus</h1>
              </div>
              <CardTitle className="text-2xl text-center text-white">Enter OTP</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Enter the 6-digit code sent to your email
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!isVerified ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium text-[#c084fc]">
                      OTP Code
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        className="pl-10 bg-[#0f172a] border-slate-600 text-white placeholder:text-gray-500 focus:border-[#a855f7] focus:ring-[#a855f7]"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#FF6B35] hover:bg-[#f97316] text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-[#10b981] font-medium flex items-center justify-center space-x-2">
                    <span className="text-2xl">✓</span>
                    <span>OTP Verified Successfully!</span>
                  </div>
                  <p className="text-gray-400 text-sm">You can now proceed to reset your password.</p>
                  <Button
                    className="w-full bg-[#FF6B35] hover:bg-[#f97316] text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                    onClick={() => router.push("/reset-password")}
                  >
                    Reset Password
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
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
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
