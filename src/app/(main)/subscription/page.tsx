"use client";

import { Crown, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoGrid from "@/components/VideoGrid";

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            UniTube Premium
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Unlock exclusive content and features
          </p>
        </div>

        {/* Premium Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
            <Star className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Ad-Free Experience
            </h3>
            <p className="text-gray-400">Watch videos without interruptions</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
            <Crown className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Exclusive Content
            </h3>
            <p className="text-gray-400">Access premium videos and creators</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
            <Check className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              HD Quality
            </h3>
            <p className="text-gray-400">Stream in highest quality available</p>
          </div>
        </div>

        {/* Premium Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Premium Content
          </h2>
          <VideoGrid />
        </div>

        {/* Subscribe Button */}
        <div className="text-center">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8 py-6">
            <Crown className="w-5 h-5 mr-2" />
            Subscribe to Premium
          </Button>
        </div>
      </div>
    </div>
  );
}
