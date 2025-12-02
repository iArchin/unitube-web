"use client";

import { useMemo } from "react";
import VideoRow from "./VideoRow";
import { generateMockVideos } from "@/lib/mockData";

interface VideoGridProps {
  categories?: string[];
}

const VideoGrid = ({ categories = ["trending", "sports", "music", "gaming", "news"] }: VideoGridProps) => {
  const handleViewAll = (category: string) => {
    // TODO: Implement navigation to category page
    console.log(`View all ${category} videos`);
  };

  return (
    <div className="py-4 px-2 md:px-4">
      {categories.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No categories available</p>
        </div>
      ) : (
        <>
          {categories.map((category) => (
            <CategoryRow key={category} category={category} onViewAll={handleViewAll} />
          ))}
        </>
      )}
    </div>
  );
};

// Component for each category row with placeholder videos
const CategoryRow = ({ category, onViewAll }: { category: string; onViewAll: (category: string) => void }) => {
  // Generate mock videos for this category (12 videos per category)
  const videos = useMemo(() => generateMockVideos(12, category), [category]);

  return (
    <VideoRow
      title={category.charAt(0).toUpperCase() + category.slice(1)}
      videos={videos}
      onViewAll={() => onViewAll(category)}
    />
  );
};

export default VideoGrid;
