"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import Thumbnail from "@/components/Thumbnail";
import {
  fetchVideosByCategoryId,
  fetchAllCategories,
  fetchShortVideos,
  Category,
} from "@/lib/api";
import { RootState } from "@/store/store";
import { Loader2 } from "lucide-react";
import { Video } from "../../../../types/custom_types";

function TopStreamingContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const token = useSelector((state: RootState) => state.auth.token);

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryTitle, setCategoryTitle] = useState<string>("Videos");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
    setVideos([]);
  }, [categoryParam]);

  useEffect(() => {
    const loadVideos = async () => {
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      if (!categoryParam) {
        setError("Category parameter is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Handle "shorts" category specially
        if (categoryParam.toLowerCase() === "shorts") {
          setCategoryTitle("Shorts");
          const fetchedVideos = await fetchShortVideos(currentPage, 20);
          const validVideos = fetchedVideos.filter(
            (video) => video !== null && video !== undefined
          );

          if (currentPage === 1) {
            setVideos(validVideos);
          } else {
            setVideos((prev) => [...prev, ...validVideos]);
          }

          setHasMore(validVideos.length >= 20);
          setLoading(false);
          return;
        }

        // Check if categoryParam is a number (category ID) or a string (slug)
        let categoryId: number;

        // Try to parse as number first
        const parsedId = parseInt(categoryParam, 10);
        if (!isNaN(parsedId) && parsedId > 0) {
          // It's a category ID
          categoryId = parsedId;
        } else {
          // It's a slug, need to fetch categories to map slug to ID
          const categories = await fetchAllCategories(token);
          const foundCategory = categories.find(
            (cat: Category) =>
              cat.slug?.toLowerCase() === categoryParam.toLowerCase() ||
              cat.name?.toLowerCase() === categoryParam.toLowerCase() ||
              cat.title?.toLowerCase() === categoryParam.toLowerCase()
          );

          if (!foundCategory) {
            throw new Error(`Category "${categoryParam}" not found`);
          }

          // Get the ID - handle both string and number IDs
          categoryId =
            typeof foundCategory.id === "string"
              ? parseInt(foundCategory.id, 10)
              : foundCategory.id;

          // Set category title from the found category
          setCategoryTitle(
            foundCategory.title || foundCategory.name || categoryParam
          );
        }

        // Fetch videos by category ID
        const fetchedVideos = await fetchVideosByCategoryId(
          categoryId,
          token,
          currentPage,
          20
        );

        // Filter out null videos
        const validVideos = fetchedVideos.filter(
          (video) => video !== null && video !== undefined
        );

        if (currentPage === 1) {
          setVideos(validVideos);
        } else {
          setVideos((prev) => [...prev, ...validVideos]);
        }

        // Check if there are more pages (simple check - if we got less than requested, probably no more)
        setHasMore(validVideos.length >= 20);
      } catch (err) {
        console.error("Failed to fetch videos by category:", err);
        setError(err instanceof Error ? err.message : "Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [token, categoryParam, currentPage]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (loading && videos.length === 0) {
    return (
      <div className="min-h-screen py-4 px-2 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <p className="ml-3 text-white">Loading videos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-4 px-2 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-400">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-2 md:px-8 pt-32">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {categoryTitle}
        </h1>
        <p className="text-gray-400 mb-8">
          {videos.length > 0
            ? `${videos.length} video${videos.length !== 1 ? "s" : ""} found`
            : "No videos found"}
        </p>

        {videos.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">
              No videos available for this category
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <Thumbnail key={video.id} video={video} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function TopStreamingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-4 px-2 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-white">Loading...</div>
          </div>
        </div>
      }
    >
      <TopStreamingContent />
    </Suspense>
  );
}
