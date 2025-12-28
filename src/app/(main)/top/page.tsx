"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Thumbnail from "@/components/Thumbnail";
import { generateMockVideos } from "@/lib/mockData";

// Category display names mapping
const categoryNames: Record<string, { title: string; description: string }> = {
  trending: {
    title: "Top Streaming",
    description: "Most popular videos right now",
  },
  gaming: {
    title: "Games",
    description: "All gaming content",
  },
  sports: {
    title: "Teams",
    description: "All sports and team content",
  },
  music: {
    title: "Music",
    description: "All music content",
  },
  news: {
    title: "News",
    description: "All news content",
  },
};

function TopStreamingContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "trending";
  
  // Generate all videos for the selected category
  const videos = useMemo(() => generateMockVideos(48, category), [category]);
  
  const categoryInfo = categoryNames[category] || categoryNames.trending;

  return (
    <div className="min-h-screen py-4 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {categoryInfo.title}
        </h1>
        <p className="text-gray-400 mb-8">{categoryInfo.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <Thumbnail key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TopStreamingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-4 px-2 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    }>
      <TopStreamingContent />
    </Suspense>
  );
}

