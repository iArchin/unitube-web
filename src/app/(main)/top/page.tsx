"use client";

import { useMemo } from "react";
import Thumbnail from "@/components/Thumbnail";
import { generateMockVideos } from "@/lib/mockData";

export default function TopStreamingPage() {
  // Generate top trending videos
  const topVideos = useMemo(() => generateMockVideos(24, "trending"), []);

  return (
    <div className="min-h-screen py-4 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Top Streaming</h1>
        <p className="text-gray-400 mb-8">Most popular videos right now</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {topVideos.map((video) => (
            <Thumbnail key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}

