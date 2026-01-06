"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ChevronUp,
  ChevronDown,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchShortVideos, fetchVideoById } from "@/lib/api";
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
  const router = useRouter();
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
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const isNavigating = useRef<boolean>(false);
  const minSwipeDistance = 50; // Minimum distance for a swipe
  const maxSwipeTime = 300; // Maximum time for a swipe (ms)

  useEffect(() => {
    const loadShorts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Always fetch the list of shorts first
        const shortsData = await fetchShortVideos(1, 50);

        // Check if there's a specific video ID in the URL
        const videoIdFromUrl = searchParams.get("id");
        let startIndex = 0;

        if (videoIdFromUrl) {
          // Try to find the video in the shorts data
          const videoIndex = shortsData.findIndex(
            (video) => video.id === videoIdFromUrl
          );
          if (videoIndex !== -1) {
            // Video found in shorts data, set it as current index
            startIndex = videoIndex;
          } else {
            // Video not found in shorts data, try to fetch it separately
            try {
              const specificVideo = await fetchVideoById(
                videoIdFromUrl,
                token || undefined
              );
              // Verify it's a short type video and has download_link
              if (
                specificVideo &&
                specificVideo.download_link &&
                specificVideo.video_type === "short"
              ) {
                // Add the specific video at the beginning and set as current
                shortsData.unshift(specificVideo);
                startIndex = 0;
              } else {
                // Video exists but is not a short, just start from beginning
                startIndex = 0;
              }
            } catch (err) {
              console.error("Failed to fetch specific video:", err);
              // Continue with the shorts data, start from beginning
              startIndex = 0;
            }
          }
        }

        setShorts(shortsData);
        setCurrentIndex(startIndex);
        setPlayingVideos(new Set([startIndex]));
      } catch (err) {
        console.error("Failed to fetch shorts:", err);
        setError(err instanceof Error ? err.message : "Failed to load shorts");
      } finally {
        setLoading(false);
      }
    };

    loadShorts();
  }, [token, searchParams]);

  // Navigation functions - must be defined before any useEffect that uses them
  const navigateUp = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex > 0) {
        const newIndex = prevIndex - 1;
        isNavigating.current = true;
        setPlayingVideos(new Set([newIndex]));
        // Reset flag after navigation completes
        setTimeout(() => {
          isNavigating.current = false;
        }, 500);
        return newIndex;
      }
      return prevIndex;
    });
  }, []);

  const navigateDown = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < shorts.length - 1) {
        const newIndex = prevIndex + 1;
        isNavigating.current = true;
        setPlayingVideos(new Set([newIndex]));
        // Reset flag after navigation completes
        setTimeout(() => {
          isNavigating.current = false;
        }, 500);
        return newIndex;
      }
      return prevIndex;
    });
  }, [shorts.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        navigateUp();
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        navigateDown();
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        navigateUp();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        navigateDown();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigateUp, navigateDown]);

  // Update URL params when current video changes
  useEffect(() => {
    if (!loading && shorts.length > 0 && currentIndex < shorts.length) {
      const currentVideo = shorts[currentIndex];
      if (currentVideo && currentVideo.id) {
        // Update URL with current video ID
        const newUrl = `/shorts?id=${currentVideo.id}`;
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [currentIndex, shorts, loading, router]);

  // Handle scroll navigation and auto-play
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (isScrolling) return;
      isScrolling = true;

      // Clear any existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // Debounce scroll handling
      scrollTimeout = setTimeout(() => {
        // Don't update index if we're programmatically navigating
        if (isNavigating.current) {
          isScrolling = false;
          return;
        }

        const scrollPosition = container.scrollTop;
        const itemHeight = window.innerHeight;
        const newIndex = Math.round(scrollPosition / itemHeight);

        if (
          newIndex !== currentIndex &&
          newIndex >= 0 &&
          newIndex < shorts.length
        ) {
          setCurrentIndex(newIndex);
          // Pause previous video and play current
          setPlayingVideos(new Set([newIndex]));
        }

        isScrolling = false;
      }, 150);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [currentIndex, shorts.length]);

  // Scroll to current video when index changes (but not from user scroll)
  useEffect(() => {
    if (videoRefs.current[currentIndex] && shorts.length > 0) {
      const container = containerRef.current;
      if (!container) return;

      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        const targetElement = videoRefs.current[currentIndex];
        if (targetElement) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          const scrollTop =
            container.scrollTop + (targetRect.top - containerRect.top);

          container.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }
      });
    }
  }, [currentIndex, shorts.length]);

  // Handle touch/swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) {
      touchStartY.current = 0;
      touchEndY.current = 0;
      return;
    }

    const distance = touchStartY.current - touchEndY.current;
    const swipeTime = Date.now() - touchStartTime.current;
    const isUpSwipe = distance > minSwipeDistance && swipeTime < maxSwipeTime;
    const isDownSwipe =
      distance < -minSwipeDistance && swipeTime < maxSwipeTime;

    if (isUpSwipe) {
      navigateDown();
    } else if (isDownSwipe) {
      navigateUp();
    }

    // Reset touch positions
    touchStartY.current = 0;
    touchEndY.current = 0;
    touchStartTime.current = 0;
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
      {/* Navigation Arrows - Always visible */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-30 flex-col gap-3 hidden sm:flex items-center">
        <button
          onClick={navigateUp}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg border border-white/10"
          aria-label="Previous short"
        >
          <ChevronUp className="w-6 h-6 text-white" />
        </button>

        {/* Video counter */}
        <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/10">
          {currentIndex + 1} / {shorts.length}
        </div>

        <button
          onClick={navigateDown}
          disabled={currentIndex >= shorts.length - 1}
          className="p-3 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg border border-white/10"
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {shorts.map((short, index) => (
          <div
            key={short.id}
            ref={(el) => (videoRefs.current[index] = el)}
            className="h-screen snap-start flex flex-col items-center justify-center gap-5 px-4 md:px-6 pb-20 md:pb-0"
          >
            {/* Video Player */}
            <div className="w-full max-w-[480px] h-[70vh] max-h-[75vh] md:h-[75vh]">
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
                    playsinline={true}
                    style={{ position: "absolute", top: 0, left: 0 }}
                    config={{
                      file: {
                        attributes: {
                          controlsList: "nodownload",
                          playsInline: true,
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
                    {formatPublishedDate(short.created_at)}
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
                    className="bg-purple-500 hover:bg-purple-700 text-white"
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
