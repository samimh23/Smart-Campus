'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Mail, ArrowLeftCircle } from 'lucide-react'
import { forgotPassword } from '@/app/api/services/auth'


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
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
      router.push(`/otp?email=${encodeURIComponent(email)}`) // pass email to OTP page
    } else {
      alert(response.message)
    }
  } catch (err) {
    console.error(err)
    alert('Something went wrong!')
  } finally {
    setIsLoading(false)
  }
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col space-y-6 p-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Smart Campus</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Digital Learning Platform</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Reset Your Password Securely
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Enter your registered email address to receive a password reset link. 
              We’ll help you get back into your account safely.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
              Secure Recovery
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Email Verification
            </Badge>
          </div>
        </div>

        {/* Right Side - Forgot Password Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center justify-center space-x-2 mb-4 lg:hidden">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Campus</h1>
              </div>
              <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
              <CardDescription className="text-center">
                Enter your email and we’ll send you a reset link
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@campus.edu"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 shadow-lg transition-all duration-200 hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-green-600 font-medium">
                    ✅ A password reset link has been sent to your email.
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Please check your inbox (and spam folder) for further instructions.
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-4 flex justify-center">
              <Button
                variant="link"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center space-x-1"
                onClick={() => window.history.back()}
              >
                <ArrowLeftCircle className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
