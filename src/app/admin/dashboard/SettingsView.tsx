"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SettingsViewProps {
  email: string
}

export default function SettingsView({ email }: SettingsViewProps) {
  return (
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
  )
}