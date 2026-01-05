"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { Loader2, SearchX } from "lucide-react";

import Thumbnail from "@/components/Thumbnail";
import { fetchSearchQuery } from "@/lib/api";
import { Video } from "../../../../types/custom_types";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const token = useSelector((state: RootState) => state.auth.token);

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Reset when query changes
  useEffect(() => {
    setVideos([]);
    setPage(1);
    setHasMore(false);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    const searchVideos = async () => {
      if (!query) {
        setLoading(false);
        setError(null);
        setVideos([]);
        setHasMore(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await fetchSearchQuery(query, page, 12, token || "");

        if (!result) {
          throw new Error("Failed to fetch search results");
        }

        setVideos((prev) =>
          page === 1 ? result.videos : [...prev, ...result.videos]
        );
        setHasMore(result.pagination?.hasMore ?? false);
      } catch (err) {
        console.error("Failed to fetch search results:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load search results"
        );
      } finally {
        setLoading(false);
      }
    };

    searchVideos();
  }, [query, page, token]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const showEmpty =
    !loading && !error && query.length > 0 && videos.length === 0;

  return (
    <div className="min-h-screen py-4 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Search
        </h1>
        <p className="text-gray-400 mb-6">
          {query
            ? `Showing results for "${query}"`
            : "Enter a search term to see results"}
        </p>

        {!query ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <SearchX className="w-10 h-10 mb-4" />
            <p>Type something in the search bar to find videos.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-400">
            <p>{error}</p>
          </div>
        ) : loading && videos.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-white">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <p>Searching videos...</p>
          </div>
        ) : showEmpty ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <SearchX className="w-10 h-10 mb-4" />
            <p>No videos found for this search.</p>
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
                <Button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
