"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import VideoRow from "./VideoRow";
import { fetchCategoriesWithVideos, CategoryWithVideos } from "@/lib/api";
import { Video } from "../../types/custom_types";
import { RootState } from "@/store/store";

interface VideoGridProps {
  categories?: string[];
}

const VideoGrid = ({
  categories = ["trending", "sports", "music", "gaming", "news"],
}: VideoGridProps) => {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token);
  const [categoriesData, setCategoriesData] = useState<CategoryWithVideos[]>(
    []
  );
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
        const data = await fetchCategoriesWithVideos(token, 1, 10);
        setCategoriesData(data);
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

  // Find shorts category or use first category's videos as shorts
  const shortsCategory = categoriesData.find(
    (cat) =>
      cat.slug.toLowerCase() === "shorts" ||
      cat.title.toLowerCase() === "shorts"
  );
  const shortsVideos: Video[] = shortsCategory?.videos || [];

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
          {shortsVideos.length > 0 && (
            <VideoRow
              title="Shorts"
              videos={shortsVideos}
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
