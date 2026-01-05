"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCount, formatPublishedDate } from "@/lib/utils";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import RelatedVideos from "@/components/RelatedVideos";
import { generateMockVideos } from "@/lib/mockData";
import { Video } from "../../../../../types/custom_types";
import { Button } from "@/components/ui/button";
import { fetchVideoById } from "@/lib/api";
import { RootState } from "@/store/store";

// Comment type
interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  dislikes: number;
  timeAgo: string;
  userLiked?: boolean;
  userDisliked?: boolean;
}

// Dynamically import react-player to avoid SSR issues
// Use react-player (not youtube-specific) to support file URLs
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
});

// Default video data - you can customize this
const getDefaultVideo = (id: string | string[] | undefined): Video => {
  const defaultVideos = generateMockVideos(1, "trending");
  const video = defaultVideos[0];

  return {
    ...video,
    id: (id as string) || video.id,
    title: "Amazing Tech Review 2024 - Latest Features & Updates",
    description: `This is a comprehensive review of the latest technology trends in 2024. 
    We cover everything from new smartphone releases to cutting-edge AI developments. 
    Join us as we explore the future of technology and how it's shaping our world. 
    Don't forget to like and subscribe for more tech content!`,
  };
};

// Default comments data
const defaultComments = [
  {
    id: 1,
    author: "John Doe",
    avatar: "JD",
    text: "Great video! Really helpful content. The explanations were clear and easy to follow. Keep up the great work!",
    likes: 124,
    dislikes: 2,
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    author: "Sarah Miller",
    avatar: "SM",
    text: "Thanks for the detailed explanation! This really cleared things up for me. Can't wait for the next video.",
    likes: 89,
    dislikes: 0,
    timeAgo: "5 hours ago",
  },
  {
    id: 3,
    author: "Mike Wilson",
    avatar: "MW",
    text: "Awesome tutorial! Can you make more videos on this topic? I'd love to see a deep dive into the advanced features.",
    likes: 156,
    dislikes: 1,
    timeAgo: "1 day ago",
  },
  {
    id: 4,
    author: "Anna Lee",
    avatar: "AL",
    text: "This is exactly what I was looking for. Bookmarked for future reference! The examples were spot on.",
    likes: 67,
    dislikes: 0,
    timeAgo: "2 days ago",
  },
  {
    id: 5,
    author: "Robert Brown",
    avatar: "RB",
    text: "Clear and concise. The examples really helped me understand the concepts better. Subscribed!",
    likes: 98,
    dislikes: 0,
    timeAgo: "3 days ago",
  },
  {
    id: 6,
    author: "Emily Chen",
    avatar: "EC",
    text: "Love the production quality! The visuals and editing are top-notch. Looking forward to more content like this.",
    likes: 203,
    dislikes: 3,
    timeAgo: "4 days ago",
  },
];

const VideoDetails = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const [isMounted, setIsMounted] = useState(false);
  const [substringCount, setSubstringCount] = useState<undefined | number>(200);
  const [newComment, setNewComment] = useState("");
  const [videoDetails, setVideoDetails] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(defaultComments);
  const [subscriberCount] = useState(() => Math.floor(Math.random() * 1000000));
  
  // Get data from URL query parameters if available
  const urlDownloadLink = searchParams.get("url");
  const urlTitle = searchParams.get("title");
  const urlDescription = searchParams.get("description");
  const urlChannel = searchParams.get("channel");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadVideo = async () => {
      if (!id) {
        setVideoDetails(getDefaultVideo(id));
        setLoading(false);
        return;
      }

      // If URL parameters are provided, use them immediately to show data fast
      if (urlDownloadLink || urlTitle || urlDescription || urlChannel) {
        setError(null);
        
        // Create initial video object from URL parameters
        const initialVideo: Video = {
          id: id as string,
          title: urlTitle || "Loading...",
          description: urlDescription || "",
          thumbnail: "",
          viewCount: "0",
          channel: {
            channelId: "",
            channelTitle: urlChannel || "Loading...",
            channelImage: "",
          },
          publishedDate: new Date().toISOString(),
          download_link: urlDownloadLink || null,
        };

        // Set initial data immediately for fast display (no loading state)
        setVideoDetails(initialVideo);
        setLikes(Math.floor(Math.random() * 50000));
        setLoading(false); // Show content immediately

        // Then try to fetch full video details from API if token is available
        // This will fill in missing data like thumbnail, viewCount, etc.
        if (token) {
          try {
            const video = await fetchVideoById(id as string, token);
            // Merge API data with URL parameters (URL params take precedence)
            setVideoDetails({
              ...video,
              download_link: urlDownloadLink || video.download_link,
              // URL params take precedence, but use API data if URL params not provided
              title: urlTitle || video.title,
              description: urlDescription || video.description,
              channel: {
                ...video.channel,
                channelTitle: urlChannel || video.channel.channelTitle,
              },
            });
          } catch (err) {
            // If fetch fails, keep the URL parameter data we already set
            console.warn("Failed to fetch video details, using URL parameters:", err);
            // initialVideo is already set, so we keep it
          }
        }
        return;
      }

      // No URL parameters, fetch from API
      if (!token) {
        // Fallback to default video if no token
        setVideoDetails(getDefaultVideo(id));
        setLikes(Math.floor(Math.random() * 50000));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const video = await fetchVideoById(id as string, token);
        setVideoDetails(video);
        // Initialize likes/dislikes
        setLikes(Math.floor(Math.random() * 50000));
      } catch (err) {
        console.error("Failed to fetch video:", err);
        setError(err instanceof Error ? err.message : "Failed to load video");
        // Fallback to default video on error
        setVideoDetails(getDefaultVideo(id));
        setLikes(Math.floor(Math.random() * 50000));
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [id, token, urlDownloadLink, urlTitle, urlDescription, urlChannel]);

  // Handle like button
  const handleLike = () => {
    if (userDisliked) {
      setDislikes((prev) => prev - 1);
      setUserDisliked(false);
    }
    if (userLiked) {
      setLikes((prev) => prev - 1);
      setUserLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setUserLiked(true);
    }
  };

  // Handle dislike button
  const handleDislike = () => {
    if (userLiked) {
      setLikes((prev) => prev - 1);
      setUserLiked(false);
    }
    if (userDisliked) {
      setDislikes((prev) => prev - 1);
      setUserDisliked(false);
    } else {
      setDislikes((prev) => prev + 1);
      setUserDisliked(true);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;

    const authorName = user?.name || "Anonymous";
    const authorInitials = authorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AN";

    const newCommentObj: Comment = {
      id: Date.now(),
      author: authorName,
      avatar: authorInitials,
      text: newComment.trim(),
      likes: 0,
      dislikes: 0,
      timeAgo: "just now",
      userLiked: false,
      userDisliked: false,
    };

    setComments((prev) => [newCommentObj, ...prev]);
    setNewComment("");
  };

  // Handle comment like/dislike
  const handleCommentLike = (commentId: number) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          if (comment.userDisliked) {
            return {
              ...comment,
              dislikes: comment.dislikes - 1,
              userDisliked: false,
              likes: comment.userLiked ? comment.likes - 1 : comment.likes + 1,
              userLiked: !comment.userLiked,
            };
          }
          return {
            ...comment,
            likes: comment.userLiked ? comment.likes - 1 : comment.likes + 1,
            userLiked: !comment.userLiked,
          };
        }
        return comment;
      })
    );
  };

  const handleCommentDislike = (commentId: number) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          if (comment.userLiked) {
            return {
              ...comment,
              likes: comment.likes - 1,
              userLiked: false,
              dislikes: comment.userDisliked
                ? comment.dislikes - 1
                : comment.dislikes + 1,
              userDisliked: !comment.userDisliked,
            };
          }
          return {
            ...comment,
            dislikes: comment.userDisliked
              ? comment.dislikes - 1
              : comment.dislikes + 1,
            userDisliked: !comment.userDisliked,
          };
        }
        return comment;
      })
    );
  };

  // Use default video data if not loaded yet
  const currentVideo = videoDetails || getDefaultVideo(id);

  // Memoize formatted published date to prevent recalculation on re-renders
  const formattedPublishedDate = useMemo(() => {
    return formatPublishedDate(
      videoDetails?.publishedDate || currentVideo.publishedDate
    );
  }, [videoDetails?.publishedDate, currentVideo.publishedDate]);

  // Generate related videos using mock data - memoize to prevent regeneration on re-renders
  const relatedVideos = useMemo(() => generateMockVideos(8, "trending"), []);

  // Determine video URL - prioritize download_link from URL query param, then from currentVideo
  // If no download_link, fallback to YouTube (though this shouldn't happen for uploaded videos)
  const videoUrl = urlDownloadLink || currentVideo.download_link || `https://www.youtube.com/watch?v=dQw4w9WgXcQ`;
  
  // Check if we have a valid video URL to play (either from URL param or from video details)
  const hasVideoUrl = !!urlDownloadLink || !!currentVideo.download_link;

  return (
    <div className="min-h-screen bg-[#111111] pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="grid grid-cols-12 gap-4 md:gap-7">
          {/* Main Video Section */}
          <div className="md:col-span-8 col-span-12">
            {/* Video Player */}
            <div className="w-full mb-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                {loading && !urlDownloadLink ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-white">Loading video...</p>
                  </div>
                ) : error && !hasVideoUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-red-500">Error: {error}</p>
                  </div>
                ) : isMounted && hasVideoUrl ? (
                  <ReactPlayer
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    playing={false}
                    controls={true}
                    config={{
                      file: {
                        attributes: {
                          controlsList: "nodownload",
                        },
                      },
                      youtube: {
                        playerVars: {
                          modestbranding: 1,
                          rel: 0,
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-white">No video available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Info */}
            <div className="mb-4">
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
                {videoDetails?.title || currentVideo.title}
              </h3>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={videoDetails?.channel.channelImage || currentVideo.channel.channelImage}
                      alt={videoDetails?.channel.channelTitle || currentVideo.channel.channelTitle}
                    />
                    <AvatarFallback>
                      {(videoDetails?.channel.channelTitle || currentVideo.channel.channelTitle)
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-white text-sm font-medium">
                      {videoDetails?.channel.channelTitle || currentVideo.channel.channelTitle}
                    </h4>
                    <p className="text-gray-400 text-xs">
                      {formatCount(subscriberCount)}{" "}
                      subscribers
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4 text-sm items-center bg-[#1a1a1a] text-white px-3 md:px-5 py-2 rounded-3xl">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 transition-colors ${
                      userLiked
                        ? "text-blue-500"
                        : "hover:text-blue-500"
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-sm">{formatCount(likes)}</span>
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    onClick={handleDislike}
                    className={`flex items-center transition-colors ${
                      userDisliked
                        ? "text-red-500"
                        : "hover:text-red-500"
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    {dislikes > 0 && (
                      <span className="text-sm ml-1">{formatCount(dislikes)}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-[#1a1a1a] text-white rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">
                  {formatCount(+(videoDetails?.viewCount || currentVideo.viewCount))} views •{" "}
                  {formattedPublishedDate}
                </span>
              </div>
              <p className="leading-6 text-sm text-gray-300">
                {(videoDetails?.description || currentVideo.description).substring(
                  0,
                  substringCount ||
                    (videoDetails?.description || currentVideo.description).length
                )}
                {substringCount &&
                  substringCount <
                    (videoDetails?.description || currentVideo.description).length &&
                  "..."}
                {(videoDetails?.description || currentVideo.description).length > 200 && (
                  <button
                    onClick={() =>
                      substringCount === 200
                        ? setSubstringCount(undefined)
                        : setSubstringCount(200)
                    }
                    className="font-medium cursor-pointer text-sm underline text-blue-400 ml-1 hover:text-blue-500"
                  >
                    {substringCount === 200 ? "Show more" : "Show less"}
                  </button>
                )}
              </p>
            </div>

            {/* Comments Section */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-6 text-white">
                {comments.length} Comment{comments.length !== 1 ? "s" : ""}
              </h4>

              {/* Add Comment Input */}
              <div className="mb-6">
                <div className="flex space-x-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "AN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setNewComment(e.target.value)
                      }
                      className="w-full min-h-[80px] p-3 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#1a1a1a] text-white placeholder-gray-400"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewComment("")}
                        disabled={!newComment.trim()}
                        className="text-gray-400 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCommentSubmit}
                        disabled={!newComment.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-gray-600 text-white">
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
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className={`flex items-center space-x-1 text-xs transition-colors ${
                            comment.userLiked
                              ? "text-blue-400"
                              : "text-gray-400 hover:text-blue-400"
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{formatCount(comment.likes)}</span>
                        </button>
                        <button
                          onClick={() => handleCommentDislike(comment.id)}
                          className={`flex items-center space-x-1 text-xs transition-colors ${
                            comment.userDisliked
                              ? "text-red-400"
                              : "text-gray-400 hover:text-red-400"
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          {comment.dislikes > 0 && (
                            <span>{formatCount(comment.dislikes)}</span>
                          )}
                        </button>
                        <button className="text-xs text-gray-400 hover:text-white transition-colors">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Videos Sidebar */}
          <aside className="md:col-span-4 col-span-12">
            <h4 className="text-white font-semibold mb-4 px-2">
              Related Videos
            </h4>
            <div className="space-y-2">
              {relatedVideos.map((video) => (
                <RelatedVideos key={video.id} video={video} />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;
