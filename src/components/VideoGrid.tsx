"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import VideoRow from "./VideoRow";
import { generateMockVideos } from "@/lib/mockData";

interface VideoGridProps {
  categories?: string[];
}

const VideoGrid = ({
  categories = ["trending", "sports", "music", "gaming", "news"],
}: VideoGridProps) => {
  const router = useRouter();

  const handleViewAll = (category: string) => {
    router.push(`/top?category=${category}`);
  };

  // Generate shorts videos
  const shortsVideos = useMemo(() => generateMockVideos(12, "shorts"), []);

  const handleShortsViewAll = () => {
    router.push(`/top?category=shorts`);
  };

  return (
    <div className="py-4 px-4 md:px-8">
      {categories.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No categories available</p>
        </div>
      ) : (
        <>
          {/* First category row */}
          {categories.length > 0 && (
            <CategoryRow
              key={categories[0]}
              category={categories[0]}
              onViewAll={handleViewAll}
            />
          )}

          {/* Shorts Section - Second Row */}
          <VideoRow
            title="Shorts"
            videos={shortsVideos}
            onViewAll={handleShortsViewAll}
            vertical={true}
          />

          {/* Remaining category rows */}
          {categories.slice(1).map((category) => (
            <CategoryRow
              key={category}
              category={category}
              onViewAll={handleViewAll}
            />
          ))}
        </>
      )}
    </div>
  );
};

// Component for each category row with placeholder videos
const CategoryRow = ({
  category,
  onViewAll,
}: {
  category: string;
  onViewAll: (category: string) => void;
}) => {
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
