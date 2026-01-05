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
  const [shortsError, setShortsError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        setShortsError(null);

        // Fetch categories and shorts separately to handle errors independently
        // Pass token if available, otherwise pass empty string (API will handle it)
        const categoriesPromise = fetchCategoriesWithVideos(token || "", 1, 10);
        const shortsPromise = fetchShortVideos(1, 10);

        // Fetch categories
        try {
          const categoriesData = await categoriesPromise;
          setCategoriesData(categoriesData);
        } catch (err) {
          console.error("Failed to fetch categories with videos:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load videos"
          );
          setCategoriesData([]);
        }

        // Fetch shorts independently
        try {
          const shortsData = await shortsPromise;

          setShortsVideos(shortsData);
          if (shortsData.length === 0 && shortsData.length > 0) {
            console.warn(
              "All short videos were filtered out. Original count:",
              shortsData.length
            );
          }
        } catch (err) {
          console.error("Failed to fetch short videos:", err);
          setShortsError(
            err instanceof Error ? err.message : "Failed to load shorts"
          );
          setShortsVideos([]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
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

  // Shorts are already filtered when setting state, so use them directly
  const validShortsVideos = shortsVideos;

  // Filter out shorts from main categories
  const mainCategories = categoriesData.filter(
    (cat) =>
      cat.slug.toLowerCase() !== "shorts" &&
      cat.title.toLowerCase() !== "shorts"
  );

  // Don't return early if only categories fail - shorts might still be available
  const hasCategories = categoriesData.length > 0;
  const hasShorts = validShortsVideos.length > 0 || shortsError;

  if (error && !hasCategories && !hasShorts) {
    return (
      <div className="py-4 px-4 md:px-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!hasCategories && !hasShorts) {
    return (
      <div className="py-4 px-4 md:px-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No content available</p>
        </div>
      </div>
    );
  }

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

      {/* Shorts Section - Show even if no categories */}
      {shortsError ? (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xl font-bold text-foreground">Shorts</h2>
          </div>
          <div className="px-2">
            <p className="text-sm text-muted-foreground">
              Unable to load shorts: {shortsError}
            </p>
          </div>
        </div>
      ) : validShortsVideos.length > 0 ? (
        <VideoRow
          title="Shorts"
          videos={validShortsVideos}
          onViewAll={handleShortsViewAll}
          vertical={true}
        />
      ) : null}
    </div>
  );
};

export default VideoGrid;
