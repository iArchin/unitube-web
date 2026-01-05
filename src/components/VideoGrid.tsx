"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import VideoRow from "./VideoRow";
import {
  fetchCategoriesWithVideos,
  CategoryWithVideos,
  fetchShortVideos,
} from "@/lib/api";
import { Video } from "../../types/custom_types";
import { RootState } from "@/store/store";

const VideoGrid = () => {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [categoriesData, setCategoriesData] = useState<CategoryWithVideos[]>(
    []
  );
  const [shortsVideos, setShortsVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch categories and shorts in parallel
        const [categoriesData, shortsData] = await Promise.all([
          fetchCategoriesWithVideos(token, 1, 10),
          fetchShortVideos(token, 1, 10),
        ]);

        setCategoriesData(categoriesData);
        // Filter out null videos, videos with missing critical properties, and videos with null download_link
        setShortsVideos(
          shortsData.filter(
            (video) =>
              video !== null &&
              video !== undefined &&
              video.id &&
              video.title &&
              video.thumbnail &&
              video.download_link !== null &&
              video.download_link !== undefined
          )
        );
      } catch (err) {
        console.error("Failed to fetch categories with videos:", err);
        setError(err instanceof Error ? err.message : "Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [token]);

  const handleViewAll = (category: string) => {
    router.push(`/top?category=${category}`);
  };

  const handleShortsViewAll = () => {
    router.push(`/top?category=shorts`);
  };

  if (loading) {
    return (
      <div className="py-4 px-4 md:px-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 px-4 md:px-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (categoriesData.length === 0) {
    return (
      <div className="py-4 px-4 md:px-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No categories available</p>
        </div>
      </div>
    );
  }

  // Filter out shorts from main categories
  const mainCategories = categoriesData.filter(
    (cat) =>
      cat.slug.toLowerCase() !== "shorts" &&
      cat.title.toLowerCase() !== "shorts"
  );

  // Filter out null videos, videos with missing critical properties, and videos with null download_link from shorts
  const validShortsVideos = shortsVideos.filter(
    (video) =>
      video !== null &&
      video !== undefined &&
      video.id &&
      video.title &&
      video.thumbnail &&
      video.download_link !== null &&
      video.download_link !== undefined
  );

  return (
    <div className="py-4 px-4 md:px-8">
      {mainCategories.length > 0 && (
        <>
          {/* First category row */}
          <VideoRow
            title={mainCategories[0].title}
            videos={mainCategories[0].videos}
            onViewAll={() => handleViewAll(mainCategories[0].slug)}
          />

          {/* Shorts Section - Second Row (if available) */}
          {validShortsVideos.length > 0 && (
            <VideoRow
              title="Shorts"
              videos={validShortsVideos}
              onViewAll={handleShortsViewAll}
              vertical={true}
            />
          )}

          {/* Remaining category rows */}
          {mainCategories.slice(1).map((category) => (
            <VideoRow
              key={category.id}
              title={category.title}
              videos={category.videos}
              onViewAll={() => handleViewAll(category.slug)}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default VideoGrid;
