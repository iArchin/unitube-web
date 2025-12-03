"use client";

import { Upload, Video, Image as ImageIcon, Link2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreatePage() {
  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create Content</h1>
        <p className="text-gray-400 mb-8">Upload and share your videos with the world</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Video Card */}
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#333] hover:border-purple-500 transition-colors cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Upload Video</h3>
              <p className="text-gray-400 text-sm mb-4">Share your video content</p>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </div>
          </div>

          {/* Create Short Card */}
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#333] hover:border-purple-500 transition-colors cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Create Short</h3>
              <p className="text-gray-400 text-sm mb-4">Create short-form content</p>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Create Short
              </Button>
            </div>
          </div>

          {/* Go Live Card */}
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#333] hover:border-purple-500 transition-colors cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Go Live</h3>
              <p className="text-gray-400 text-sm mb-4">Start a live stream</p>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                Start Streaming
              </Button>
            </div>
          </div>

          {/* Create Post Card */}
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#333] hover:border-purple-500 transition-colors cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Create Post</h3>
              <p className="text-gray-400 text-sm mb-4">Share updates and thoughts</p>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                <Link2 className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

