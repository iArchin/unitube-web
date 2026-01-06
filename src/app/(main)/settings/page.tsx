"use client";

import { Settings, User, Bell, Shield, Globe, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="min-h-screen py-8 px-4 md:px-8 pt-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Settings
          </h1>
        </div>

        {/* Account Settings */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 mb-6 border border-[#333]">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Account</h2>
          </div>
          <Separator className="bg-[#333] mb-4" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Profile Information</p>
                <p className="text-sm text-gray-400">
                  Manage your profile details
                </p>
              </div>
              <Button
                variant="outline"
                className="border-[#333] text-white hover:bg-[#333]"
              >
                Edit
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Change Password</p>
                <p className="text-sm text-gray-400">
                  Update your account password
                </p>
              </div>
              <Button
                variant="outline"
                className="border-[#333] text-white hover:bg-[#333]"
              >
                Change
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 mb-6 border border-[#333]">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
          </div>
          <Separator className="bg-[#333] mb-4" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-gray-400">
                  Receive updates via email
                </p>
              </div>
              <Button
                variant="outline"
                className="border-[#333] text-white hover:bg-[#333]"
              >
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Push Notifications</p>
                <p className="text-sm text-gray-400">
                  Get notified about new content
                </p>
              </div>
              <Button
                variant="outline"
                className="border-[#333] text-white hover:bg-[#333]"
              >
                Configure
              </Button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 mb-6 border border-[#333]">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">
              Privacy & Security
            </h2>
          </div>
          <Separator className="bg-[#333] mb-4" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Privacy Settings</p>
                <p className="text-sm text-gray-400">
                  Control who can see your activity
                </p>
              </div>
              <Button
                variant="outline"
                className="border-[#333] text-white hover:bg-[#333]"
              >
                Manage
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Download Data</p>
                <p className="text-sm text-gray-400">
                  Export your account data
                </p>
              </div>
              <Button
                variant="outline"
                className="border-[#333] text-white hover:bg-[#333]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Language & Region */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 mb-6 border border-[#333]">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">
              Language & Region
            </h2>
          </div>
          <Separator className="bg-[#333] mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Language</p>
              <p className="text-sm text-gray-400">
                Select your preferred language
              </p>
            </div>
            <Button
              variant="outline"
              className="border-[#333] text-white hover:bg-[#333]"
            >
              English
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
