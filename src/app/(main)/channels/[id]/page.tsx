//@ts-nocheck

"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dot, Pencil } from "lucide-react";
import { fetchUserVideos } from "@/lib/api";
import { Video } from "../../../../../types/custom_types";
import { RootState } from "@/store/store";
import { formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Thumbnail from "@/components/Thumbnail";
import EditProfileModal from "@/components/EditProfileModal";

const ChannelPage = () => {
  const { id } = useParams();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalVideos, setTotalVideos] = useState(0);
  const [activeTab, setActiveTab] = useState<"videos" | "shorts">("videos");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // User profile info from first video (if available)
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    userId: string;
    profileImage?: string | null;
    bio?: string | null;
  } | null>(null);

  // Handle "me" route - redirect to current user's channel
  useEffect(() => {
    if (id === "me" && currentUser?.id) {
      window.location.href = `/channels/${currentUser.id}`;
    }
  }, [id, currentUser]);

  useEffect(() => {
    const loadUserVideos = async () => {
      // If "me" is requested but no user is logged in
      if (id === "me" && !currentUser?.id) {
        setError("Please log in to view your channel");
        setLoading(false);
        return;
      }

      // Use actual user ID if "me" is requested
      const userId =
        id === "me"
          ? currentUser?.id?.toString()
          : Array.isArray(id)
          ? id[0]
          : id;

      if (!userId) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await fetchUserVideos(
          userId as string,
          page,
          20,
          token || undefined
        );

        if (!result) {
          throw new Error("Failed to fetch user videos");
        }

        // Store all videos
        const allVideos =
          page === 1 ? result.videos : [...videos, ...result.videos];
        setVideos(allVideos);
        setHasMore(result.pagination.hasMore);
        setTotalVideos(result.pagination.total);

        // Extract user profile from first video if available
        if (result.videos.length > 0 && result.videos[0].user) {
          setUserProfile({
            name: result.videos[0].user.name,
            email: result.videos[0].user.email,
            userId: result.videos[0].channel.channelId,
            profileImage: result.videos[0].user.profile_image,
            bio: result.videos[0].user.bio_description,
          });
        } else if (result.videos.length > 0) {
          // Fallback to channel info if user info not available
          setUserProfile({
            name: result.videos[0].channel.channelTitle,
            email: "",
            userId: result.videos[0].channel.channelId,
            profileImage: null,
            bio: null,
          });
        }
      } catch (err) {
        console.error("Failed to fetch user videos:", err);
        setError(err instanceof Error ? err.message : "Failed to load channel");
      } finally {
        setLoading(false);
      }
    };

    loadUserVideos();
  }, [id, page, token, currentUser]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // Generate avatar initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if this is the current user's channel
  const actualUserId = id === "me" ? currentUser?.id?.toString() : id;
  const isCurrentUser = currentUser?.id.toString() === actualUserId;

  // Final display data (use Redux for current user to reflect live updates)
  const displayName = isCurrentUser ? currentUser?.name : userProfile?.name;
  const displayEmail = isCurrentUser ? currentUser?.email : userProfile?.email;
  const displayImage = isCurrentUser
    ? currentUser?.profile_image
    : userProfile?.profileImage;
  const displayBio = isCurrentUser
    ? currentUser?.bio_description
    : userProfile?.bio;

  // Filter videos by type based on active tab
  const longVideos = videos.filter(
    (v) => !v.video_type || v.video_type !== "short"
  );
  const shortVideos = videos.filter((v) => v.video_type === "short");
  const filteredVideos = activeTab === "shorts" ? shortVideos : longVideos;

  if (loading && videos.length === 0) {
    return (
      <div className="min-h-screen pt-16 md:pt-20 px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header Skeleton */}
          <div className="mb-10 flex flex-col md:flex-row items-center space-x-5">
            <Skeleton className="w-28 h-28 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full max-w-xl" />
            </div>
          </div>
          {/* Videos Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-video rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 md:pt-20 px-4 md:px-8 pb-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 md:pt-20 px-4 md:px-8 pb-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="mb-10 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-5 px-3">
          <Avatar className="w-28 h-28 flex-shrink-0 border-2 border-purple-500/20">
            <AvatarImage
              src={displayImage || undefined}
              alt={displayName || "User"}
              className="object-cover"
            />
            <AvatarFallback className="text-3xl bg-purple-500 text-white">
              {displayName ? getInitials(displayName) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
              <h2 className="font-bold text-3xl md:text-5xl text-foreground">
                {displayName || "User Channel"}
              </h2>
              {isCurrentUser && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 hover:bg-[#2a2a2a] rounded-full transition-colors text-purple-400"
                  title="Edit Profile"
                >
                  <Pencil size={20} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mb-3">
              <span className="flex items-center">
                {formatCount(totalVideos)} video{totalVideos !== 1 ? "s" : ""}
              </span>
              {displayEmail && (
                <>
                  <Dot className="w-4 h-4" />
                  <span>{displayEmail}</span>
                </>
              )}
              {isCurrentUser && (
                <>
                  <Dot className="w-4 h-4" />
                  <span className="text-purple-400">Your Channel</span>
                </>
              )}
            </div>

            {displayBio && (
              <p className="text-sm text-gray-400 max-w-2xl line-clamp-2 md:line-clamp-none">
                {displayBio}
              </p>
            )}
          </div>
        </div>

        <EditProfileModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        />

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("videos")}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === "videos"
                  ? "border-purple-500 text-purple-400 font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Videos ({longVideos.length})
            </button>
            <button
              onClick={() => setActiveTab("shorts")}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === "shorts"
                  ? "border-purple-500 text-purple-400 font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Shorts ({shortVideos.length})
            </button>
          </div>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredVideos.map((video) => (
                <Thumbnail key={video.id} video={video} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No {activeTab === "shorts" ? "shorts" : "videos"} uploaded yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelPage;
