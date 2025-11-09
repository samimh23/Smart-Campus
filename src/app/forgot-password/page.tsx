"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Mail, ArrowLeftCircle, Shield, Clock, CheckCircle2 } from "lucide-react"
import { forgotPassword } from "@/app/api/services/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await forgotPassword(email)
      console.log(response)
      if (response.success) {
        setIsSent(true)
        router.push(`/otp?email=${encodeURIComponent(email)}`)
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
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
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
            <h2 className="text-2xl font-semibold text-white">Reset Your Password Securely</h2>
            <p className="text-gray-400 leading-relaxed">
              Enter your registered email address to receive a password reset link. We'll help you get back into your
              account safely.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-[#1e293b] border border-slate-700 rounded-lg hover:border-[#a855f7] transition-all duration-300">
              <Shield className="w-6 h-6 text-[#10b981] mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Secure Recovery</h3>
                <p className="text-sm text-gray-400">Your password reset link is encrypted and expires after 1 hour</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-[#1e293b] border border-slate-700 rounded-lg hover:border-[#FF6B35] transition-all duration-300">
              <Mail className="w-6 h-6 text-[#a855f7] mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Email Verification</h3>
                <p className="text-sm text-gray-400">We'll send a verification link to your registered email</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-[#1e293b] border border-slate-700 rounded-lg hover:border-[#10b981] transition-all duration-300">
              <Clock className="w-6 h-6 text-[#FF6B35] mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Quick Process</h3>
                <p className="text-sm text-gray-400">Reset your password in just a few simple steps</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/30 transition-colors">
              Secure Recovery
            </Badge>
            <Badge className="bg-[#a855f7]/20 text-[#c084fc] border-[#a855f7]/30 hover:bg-[#a855f7]/30 transition-colors">
              Email Verification
            </Badge>
          </div>
        </div>

        {/* Right Side - Forgot Password Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border border-slate-700 bg-[#1e293b] backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center justify-center space-x-2 mb-4 lg:hidden">
                <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center shadow-md">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Smart Campus</h1>
              </div>
              <CardTitle className="text-2xl text-center text-white">Forgot Password</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Enter your email and we'll send you a reset link
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#FF6B35] hover:bg-[#f97316] shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02] text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-[#10b981] font-medium bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg p-4">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Password reset link sent successfully!</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Please check your inbox (and spam folder) for further instructions.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-4 flex justify-center">
              <Button
                variant="link"
                className="text-sm text-[#a855f7] hover:text-[#c084fc] font-medium flex items-center space-x-1"
                onClick={() => window.history.back()}
              >
                <ArrowLeftCircle className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <style jsx>{`
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
