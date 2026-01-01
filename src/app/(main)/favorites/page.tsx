"use client";

import { useMemo } from "react";
import { Heart, Bookmark } from "lucide-react";
import Thumbnail from "@/components/Thumbnail";
import { generateMockVideos } from "@/lib/mockData";

export default function FavoritesPage() {
  // Generate favorite videos (mix of categories)
  const favoriteVideos = useMemo(() => {
    const videos = [
      ...generateMockVideos(8, "trending"),
      ...generateMockVideos(8, "music"),
      ...generateMockVideos(8, "gaming"),
    ];
    return videos;
  }, []);

  return (
    <div className="min-h-screen py-4 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            My Favorites
          </h1>
        </div>
        <p className="text-gray-400 mb-8">Videos you&apos;ve saved and liked</p>

        {favoriteVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Bookmark className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-400">
              Start saving videos to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteVideos.map((video) => (
              <Thumbnail key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
