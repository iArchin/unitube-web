"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  ChevronUp, 
  ChevronDown, 
  Heart, 
  MessageCircle, 
  Share2,
  MoreVertical
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchShortVideos } from "@/lib/api";
import { Video } from "../../../../types/custom_types";
import { RootState } from "@/store/store";
import { formatCount, formatPublishedDate } from "@/lib/utils";

// Dynamically import react-player to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
});

// Default comments data
const defaultComments = [
  {
    id: 1,
    author: "John Doe",
    avatar: "JD",
    text: "This is amazing! 🔥",
    likes: 124,
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    author: "Sarah Miller",
    avatar: "SM",
    text: "Love this content!",
    likes: 89,
    timeAgo: "5 hours ago",
  },
  {
    id: 3,
    author: "Mike Wilson",
    avatar: "MW",
    text: "Keep it up! 👏",
    likes: 156,
    timeAgo: "1 day ago",
  },
];

const ShortsPage = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const searchParams = useSearchParams();
  const [shorts, setShorts] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set([0]));
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const loadShorts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Pass token if available, otherwise pass empty string (API will handle it)
        const shortsData = await fetchShortVideos(token || "", 1, 50);
        const filteredShorts = shortsData.filter(
          (video) =>
            video !== null &&
            video !== undefined &&
            video.id &&
            video.title &&
            video.thumbnail &&
            video.download_link !== null &&
            video.download_link !== undefined
        );
        setShorts(filteredShorts);

        // If a video ID is provided in the URL, find its index and set it as current
        const videoIdFromUrl = searchParams.get("id");
        if (videoIdFromUrl && filteredShorts.length > 0) {
          const videoIndex = filteredShorts.findIndex(
            (video) => video.id === videoIdFromUrl
          );
          if (videoIndex !== -1) {
            setCurrentIndex(videoIndex);
            setPlayingVideos(new Set([videoIndex]));
          }
        }
      } catch (err) {
        console.error("Failed to fetch shorts:", err);
        setError(err instanceof Error ? err.message : "Failed to load shorts");
      } finally {
        setLoading(false);
      }
    };

    loadShorts();
  }, [token, searchParams]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault();
        navigateUp();
      } else if (e.key === "ArrowDown" || e.key === "s") {
        e.preventDefault();
        navigateDown();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, shorts.length]);

  // Handle scroll navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    const handleScroll = () => {
      if (isScrolling) return;
      isScrolling = true;

      const scrollPosition = container.scrollTop;
      const itemHeight = window.innerHeight;
      const newIndex = Math.round(scrollPosition / itemHeight);

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < shorts.length) {
        setCurrentIndex(newIndex);
        // Pause previous video and play current
        setPlayingVideos(new Set([newIndex]));
      }

      setTimeout(() => {
        isScrolling = false;
      }, 100);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentIndex, shorts.length]);

  // Scroll to current video when index changes
  useEffect(() => {
    if (videoRefs.current[currentIndex] && shorts.length > 0) {
      // Use setTimeout to ensure the DOM is ready
      setTimeout(() => {
        videoRefs.current[currentIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  }, [currentIndex, shorts.length]);

  const navigateUp = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setPlayingVideos(new Set([currentIndex - 1]));
    }
  };

  const navigateDown = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setPlayingVideos(new Set([currentIndex + 1]));
    }
  };

  const toggleLike = (videoId: string) => {
    setLikedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const openComments = (videoId: string) => {
    setSelectedVideoId(videoId);
    setCommentsOpen(true);
  };

  const currentVideo = shorts[currentIndex];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading shorts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">No shorts available</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-white">
      {/* Navigation Arrows */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3">
        <button
          onClick={navigateUp}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 disabled:opacity-40 transition-colors"
          aria-label="Previous short"
        >
          <ChevronUp className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={navigateDown}
          disabled={currentIndex >= shorts.length - 1}
          className="p-2 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 disabled:opacity-40 transition-colors"
          aria-label="Next short"
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Shorts Container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {shorts.map((short, index) => (
          <div
            key={short.id}
            ref={(el) => (videoRefs.current[index] = el)}
            className="h-screen snap-start flex flex-col items-center justify-center gap-5 px-4 md:px-6"
          >
            {/* Video Player */}
            <div className="w-full max-w-[480px] h-[80vh] max-h-[85vh]">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/80">
                {short.download_link ? (
                  <ReactPlayer
                    url={short.download_link}
                    width="100%"
                    height="100%"
                    playing={playingVideos.has(index)}
                    controls={false}
                    loop={true}
                    muted={false}
                    style={{ position: "absolute", top: 0, left: 0 }}
                    config={{
                      file: {
                        attributes: {
                          controlsList: "nodownload",
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-white">Video unavailable</p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Info & Actions below the video */}
            <div className="w-full max-w-[480px] space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={short.channel.channelImage}
                    alt={short.channel.channelTitle}
                  />
                  <AvatarFallback className="text-xs">
                    {short.channel.channelTitle.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold truncate">
                    {short.channel.channelTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatCount(+short.viewCount)} views •{" "}
                    {formatPublishedDate(short.publishedDate)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold leading-snug line-clamp-3">
                  {short.title}
                </p>
                {short.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {short.description}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLike(short.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        likedVideos.has(short.id)
                          ? "text-red-500 fill-red-500"
                          : "text-white"
                      }`}
                    />
                    <span className="text-sm">
                      {likedVideos.has(short.id) ? "Liked" : "Like"}
                    </span>
                  </button>

                  <button
                    onClick={() => openComments(short.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span className="text-sm">{defaultComments.length}</span>
                  </button>

                  <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                    <Share2 className="w-5 h-5 text-white" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>

                <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comments Dialog */}
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] bg-[#1a1a1a] border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              Comments ({defaultComments.length})
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh] space-y-4 pr-2">
            {defaultComments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-gray-600 text-white text-xs">
                    {comment.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-white">
                      {comment.author}
                    </p>
                    <span className="text-[9px] text-gray-400">
                      {comment.timeAgo}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 leading-relaxed">
                    {comment.text}
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-xs hover:text-blue-400 transition-colors text-gray-400">
                      <Heart className="w-4 h-4" />
                      <span>{formatCount(comment.likes)}</span>
                    </button>
                    <button className="text-xs text-gray-400 hover:text-white transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback className="bg-blue-500 text-white">
                  AB
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  placeholder="Add a comment..."
                  className="w-full min-h-[60px] p-3 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#111111] text-white placeholder-gray-400 text-sm"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShortsPage;

