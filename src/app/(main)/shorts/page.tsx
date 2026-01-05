"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
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
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const shortsData = await fetchShortVideos(token, 1, 50);
        setShorts(
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
        console.error("Failed to fetch shorts:", err);
        setError(err instanceof Error ? err.message : "Failed to load shorts");
      } finally {
        setLoading(false);
      }
    };

    loadShorts();
  }, [token]);

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
    if (videoRefs.current[currentIndex]) {
      videoRefs.current[currentIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentIndex]);

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
      <div className="h-screen flex items-center justify-center bg-[#000000]">
        <p className="text-white">Loading shorts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#000000]">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#000000]">
        <p className="text-white">No shorts available</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#000000] overflow-hidden relative z-50">
      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={navigateUp}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all"
          aria-label="Previous short"
        >
          <ChevronUp className="w-6 h-6 text-white" />
        </button>
      )}

      {currentIndex < shorts.length - 1 && (
        <button
          onClick={navigateDown}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all"
          aria-label="Next short"
        >
          <ChevronDown className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Shorts Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {shorts.map((short, index) => (
          <div
            key={short.id}
            ref={(el) => (videoRefs.current[index] = el)}
            className="h-screen w-full snap-start relative flex items-center justify-center"
          >
            {/* Video Player */}
            <div className="w-full h-full max-w-md mx-auto relative">
              <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
                {short.download_link ? (
                  <ReactPlayer
                    url={short.download_link}
                    width="100%"
                    height="100%"
                    playing={playingVideos.has(index)}
                    controls={false}
                    loop={true}
                    muted={false}
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

              {/* Video Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-start justify-between gap-4">
                  {/* Left side - Channel info and description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={short.channel.channelImage}
                          alt={short.channel.channelTitle}
                        />
                        <AvatarFallback className="text-xs">
                          {short.channel.channelTitle.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {short.channel.channelTitle}
                        </h3>
                        <p className="text-gray-300 text-xs">
                          {formatCount(+short.viewCount)} views
                        </p>
                      </div>
                    </div>
                    <p className="text-white text-sm line-clamp-2 mb-1">
                      {short.title}
                    </p>
                    {short.description && (
                      <p className="text-gray-300 text-xs line-clamp-1">
                        {short.description}
                      </p>
                    )}
                  </div>

                  {/* Right side - Action buttons */}
                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={() => toggleLike(short.id)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                        <Heart
                          className={`w-6 h-6 ${
                            likedVideos.has(short.id)
                              ? "text-red-500 fill-red-500"
                              : "text-white"
                          }`}
                        />
                      </div>
                      <span className="text-white text-xs font-medium">
                        {likedVideos.has(short.id) ? "Liked" : "Like"}
                      </span>
                    </button>

                    <button
                      onClick={() => openComments(short.id)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-xs font-medium">
                        {defaultComments.length}
                      </span>
                    </button>

                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                        <Share2 className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-xs font-medium">Share</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 group">
                      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                        <MoreVertical className="w-6 h-6 text-white" />
                      </div>
                    </button>
                  </div>
                </div>
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

