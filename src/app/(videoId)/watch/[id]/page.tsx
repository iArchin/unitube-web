"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCount, formatPublishedDate } from "@/lib/utils";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import RelatedVideos from "@/components/RelatedVideos";
import { Video } from "../../../../../types/custom_types";
import { Button } from "@/components/ui/button";
import {
  fetchVideoById,
  fetchVideosByCategoryId,
  GetVideoResponse,
  likeVideo,
  dislikeVideo,
  fetchVideoComments,
  createComment,
  registerVideoView,
  Comment as APIComment,
} from "@/lib/api";
import { RootState } from "@/store/store";
import axios from "axios";

// Comment type for UI
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

// Convert API comment to UI comment
const convertCommentToUI = (comment: APIComment): Comment => {
  const authorName = comment.user?.name || "Anonymous";
  const authorInitials =
    authorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AN";

  // Calculate time ago
  const commentDate = new Date(comment.created_at);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);
  let timeAgo = "";
  if (diffInSeconds < 60) {
    timeAgo = "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    timeAgo = `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    timeAgo = `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    timeAgo = `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  return {
    id: comment.id,
    author: authorName,
    avatar: authorInitials,
    text: comment.body,
    likes: comment.likes_count || 0,
    dislikes: comment.dislikes_count || 0,
    timeAgo,
    userLiked: false,
    userDisliked: false,
  };
};

// Dynamically import react-player to avoid SSR issues
// Use react-player (not youtube-specific) to support file URLs
const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
});

const VideoDetails = () => {
  const { id } = useParams();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const [isMounted, setIsMounted] = useState(false);
  const [substringCount, setSubstringCount] = useState<undefined | number>(200);
  const [newComment, setNewComment] = useState("");
  const [videoDetails, setVideoDetails] = useState<Video | null>(null);
  const [apiResponse, setApiResponse] = useState<GetVideoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [disliking, setDisliking] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true); // Start as true to prevent "No comments" flash
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [relatedVideosLoading, setRelatedVideosLoading] = useState(false);

  // View tracking state
  const [viewRegistered, setViewRegistered] = useState(false);
  const videoDurationRef = useRef<number>(0);
  const viewRegistrationInProgressRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset view tracking when video ID changes
  useEffect(() => {
    setViewRegistered(false);
    videoDurationRef.current = 0;
    viewRegistrationInProgressRef.current = false;
  }, [id]);

  // Handle video progress for view tracking
  const handleProgress = useCallback(
    async (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
      // Skip if view already registered or registration in progress
      if (viewRegistered || viewRegistrationInProgressRef.current || !id) {
        return;
      }

      // Check if tab is visible
      if (document.hidden) {
        return;
      }

      // Check if user has watched at least 10% of the video
      if (state.played >= 0.1) {
        viewRegistrationInProgressRef.current = true;
        try {
          await registerVideoView(id as string);
          setViewRegistered(true);
          console.log("View registered for video:", id);
        } catch (error) {
          console.error("Failed to register view:", error);
          // Reset flag to allow retry on error
          viewRegistrationInProgressRef.current = false;
        }
      }
    },
    [viewRegistered, id]
  );

  // Handle video duration
  const handleDuration = useCallback((duration: number) => {
    videoDurationRef.current = duration;
  }, []);

  useEffect(() => {
    const loadVideo = async () => {
      if (!id) {
        setError("Video ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Set comments loading to true if we have a token (will load comments)
        if (token) {
          setCommentsLoading(true);
        }

        // Fetch raw API response to get all fields including counts
        const headers: Record<string, string> = {};
        if (token?.trim()) {
          headers.Authorization = `Bearer ${token}`;
        }

        const { data } = await axios.get<GetVideoResponse>(
          `https://api.unitribe.app/ut/api/videos/get-video`,
          {
            params: { id },
            headers,
            timeout: 10000,
          }
        );

        // Store raw API response
        setApiResponse(data);

        // Transform and set video details
        const video = await fetchVideoById(id as string, token || undefined);
        setVideoDetails(video);

        // Initialize likes/dislikes from API response
        setLikes(data.likes_count || 0);
        setDislikes(data.dislikes_count || 0);

        // Fetch related videos if category and token are available
        if (data?.category?.id && token) {
          try {
            setRelatedVideosLoading(true);
            const categoryVideos = await fetchVideosByCategoryId(
              data.category.id,
              token,
              1,
              20 // Fetch more videos to have enough after filtering
            );

            // Filter out the current video and limit to 8 videos
            const filteredVideos = categoryVideos
              .filter((v) => v.id !== id)
              .slice(0, 8);

            setRelatedVideos(filteredVideos);
          } catch (relatedErr) {
            console.error("Failed to fetch related videos:", relatedErr);
            // Don't set fallback - leave related videos empty
          } finally {
            setRelatedVideosLoading(false);
          }
        }

        // Fetch comments if token is available
        if (token) {
          try {
            setCommentsPage(1);
            const commentsResponse = await fetchVideoComments(
              id as string,
              token,
              1,
              50
            );
            const uiComments = commentsResponse.comments.data.map(
              convertCommentToUI
            );
            setComments(uiComments);
            setHasMoreComments(
              commentsResponse.comments.current_page <
                commentsResponse.comments.last_page
            );
            setCommentsTotal(commentsResponse.comments.total);
          } catch (commentsErr) {
            console.error("Failed to fetch comments:", commentsErr);
            setComments([]);
            setHasMoreComments(false);
            setCommentsTotal(0);
          } finally {
            setCommentsLoading(false);
          }
        } else {
          // If no token, set loading to false so we don't show loading state
          setCommentsLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch video:", err);
        setError(err instanceof Error ? err.message : "Failed to load video");
        // Don't set fallback - videoDetails remains null
        setCommentsLoading(false);
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [id, token]);

  // Handle like button
  const handleLike = async () => {
    if (!token || !id) {
      // If not authenticated, show message or redirect to login
      alert("Please login to like videos");
      return;
    }

    if (liking) return; // Prevent multiple simultaneous requests

    // Store previous state for potential rollback
    const wasLiked = userLiked;
    const wasDisliked = userDisliked;
    const previousLikes = likes;
    const previousDislikes = dislikes;

    try {
      setLiking(true);

      // Optimistic update
      if (wasDisliked) {
        setDislikes((prev) => prev - 1);
        setUserDisliked(false);
      }
      if (wasLiked) {
        setLikes((prev) => prev - 1);
        setUserLiked(false);
      } else {
        setLikes((prev) => prev + 1);
        setUserLiked(true);
      }

      // Call API
      await likeVideo(id as string, token);

      // Optionally refresh video data to get updated counts
      // You can refetch the video here if the API returns updated counts
    } catch (error) {
      console.error("Failed to like video:", error);
      // Revert optimistic update on error
      setLikes(previousLikes);
      setDislikes(previousDislikes);
      setUserLiked(wasLiked);
      setUserDisliked(wasDisliked);
      // Show error message to user
      alert("Failed to like video. Please try again.");
    } finally {
      setLiking(false);
    }
  };

  // Handle dislike button
  const handleDislike = async () => {
    if (!token || !id) {
      // If not authenticated, show message or redirect to login
      alert("Please login to dislike videos");
      return;
    }

    if (disliking) return; // Prevent multiple simultaneous requests

    // Store previous state for potential rollback
    const wasLiked = userLiked;
    const wasDisliked = userDisliked;
    const previousLikes = likes;
    const previousDislikes = dislikes;

    try {
      setDisliking(true);

      // Optimistic update
      if (wasLiked) {
        setLikes((prev) => prev - 1);
        setUserLiked(false);
      }
      if (wasDisliked) {
        setDislikes((prev) => prev - 1);
        setUserDisliked(false);
      } else {
        setDislikes((prev) => prev + 1);
        setUserDisliked(true);
      }

      // Call API
      await dislikeVideo(id as string, token);

      // Optionally refresh video data to get updated counts
      // You can refetch the video here if the API returns updated counts
    } catch (error) {
      console.error("Failed to dislike video:", error);
      // Revert optimistic update on error
      setLikes(previousLikes);
      setDislikes(previousDislikes);
      setUserLiked(wasLiked);
      setUserDisliked(wasDisliked);
      // Show error message to user
      alert("Failed to dislike video. Please try again.");
    } finally {
      setDisliking(false);
    }
  };

  // Load more comments
  const loadMoreComments = async () => {
    if (!id || !token || loadingMoreComments || !hasMoreComments) {
      return;
    }

    try {
      setLoadingMoreComments(true);
      const nextPage = commentsPage + 1;
      const response = await fetchVideoComments(
        id as string,
        token,
        nextPage,
        50
      );
      const newComments = response.comments.data.map(convertCommentToUI);
      setComments((prev) => [...prev, ...newComments]);
      setCommentsPage(nextPage);
      setHasMoreComments(
        response.comments.current_page < response.comments.last_page
      );
    } catch (err) {
      console.error("Failed to load more comments:", err);
    } finally {
      setLoadingMoreComments(false);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !token || !id || submittingComment) {
      if (!token) {
        alert("Please login to comment");
      }
      return;
    }

    try {
      setSubmittingComment(true);
      const createdComment = await createComment(
        id as string,
        newComment,
        token
      );
      const uiComment = convertCommentToUI(createdComment);
      setComments((prev) => [uiComment, ...prev]);
      setCommentsTotal((prev) => prev + 1);
      setNewComment("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
      alert("Failed to submit comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
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

  // Memoize formatted published date to prevent recalculation on re-renders
  const formattedPublishedDate = useMemo(() => {
    const createdAt = apiResponse?.created_at || videoDetails?.created_at;
    if (!createdAt) return "";
    return formatPublishedDate(createdAt);
  }, [apiResponse?.created_at, videoDetails?.created_at]);

  // Determine video URL from API data
  const videoUrl = videoDetails?.download_link || undefined;

  // Check if we have a valid video URL to play
  const hasVideoUrl = !!videoUrl && !!videoDetails;

  return (
    <div className="min-h-screen bg-[#111111] pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="grid grid-cols-12 gap-4 md:gap-7">
          {/* Main Video Section */}
          <div className="md:col-span-8 col-span-12">
            {/* Video Player */}
            <div className="w-full mb-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-white">Loading video...</p>
                  </div>
                ) : error ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-red-500">Error: {error}</p>
                  </div>
                ) : isMounted && hasVideoUrl && videoDetails ? (
                  <ReactPlayer
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    playing={false}
                    controls={true}
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    progressInterval={1000}
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
            {videoDetails && apiResponse && (
              <div className="mb-4">
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
                  {apiResponse.title || videoDetails.title}
                </h3>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  {apiResponse && (
                    <Link
                      href={`/channels/${apiResponse.uploader.id}`}
                      className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
                    >
                      <Avatar className="group-hover:ring-2 ring-purple-500 transition-all">
                        <AvatarImage
                          src={`https://via.placeholder.com/40x40/6366f1/ffffff?text=${apiResponse.uploader.name
                            .substring(0, 2)
                            .toUpperCase()}`}
                          alt={apiResponse.uploader.name}
                        />
                        <AvatarFallback>
                          {apiResponse.uploader.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-white text-sm font-medium group-hover:text-purple-400 transition-colors">
                          {apiResponse.uploader.name}
                        </h4>
                      </div>
                    </Link>
                  )}

                  <div className="flex space-x-4 text-sm items-center bg-[#1a1a1a] text-white px-3 md:px-5 py-2 rounded-3xl">
                    <button
                      onClick={handleLike}
                      disabled={liking || !token}
                      className={`flex items-center space-x-2 transition-colors ${
                        userLiked ? "text-blue-500" : "hover:text-blue-500"
                      } ${liking ? "opacity-50 cursor-not-allowed" : ""} ${
                        !token ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span className="text-sm">
                        {liking ? "..." : formatCount(likes)}
                      </span>
                    </button>
                    <span className="text-gray-600">|</span>
                    <button
                      onClick={handleDislike}
                      disabled={disliking || !token}
                      className={`flex items-center transition-colors ${
                        userDisliked ? "text-red-500" : "hover:text-red-500"
                      } ${disliking ? "opacity-50 cursor-not-allowed" : ""} ${
                        !token ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <ThumbsDown className="w-5 h-5" />
                      {dislikes > 0 && (
                        <span className="text-sm ml-1">
                          {disliking ? "..." : formatCount(dislikes)}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {videoDetails && apiResponse && (
              <div className="p-4 bg-[#1a1a1a] text-white rounded-lg mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    {formatCount(apiResponse.views_count || 0)} views •{" "}
                    {formattedPublishedDate}
                  </span>
                </div>
                <p className="leading-6 text-sm text-gray-300">
                  {(
                    apiResponse?.description ||
                    videoDetails.description ||
                    ""
                  ).substring(
                    0,
                    substringCount ||
                      (
                        apiResponse?.description ||
                        videoDetails.description ||
                        ""
                      ).length
                  )}
                  {substringCount &&
                    substringCount <
                      (
                        apiResponse?.description ||
                        videoDetails.description ||
                        ""
                      ).length &&
                    "..."}
                  {(apiResponse?.description || videoDetails.description || "")
                    .length > 200 && (
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
            )}

            {/* Comments Section */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-6 text-white">
                {commentsTotal > 0
                  ? `${commentsTotal} Comment${commentsTotal !== 1 ? "s" : ""}`
                  : apiResponse
                  ? `${apiResponse.comments_count || 0} Comment${
                      (apiResponse.comments_count || 0) !== 1 ? "s" : ""
                    }`
                  : `${comments.length} Comment${
                      comments.length !== 1 ? "s" : ""
                    }`}
              </h4>

              {/* Add Comment Input */}
              {token ? (
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
                        {newComment.trim() && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setNewComment("")}
                            className="text-gray-400 hover:text-white"
                          >
                            Clear
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={handleCommentSubmit}
                          disabled={!newComment.trim() || submittingComment}
                          className="bg-purple-500 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingComment ? "Posting..." : "Comment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg text-center">
                  <p className="text-gray-400 text-sm">
                    Please login to comment
                  </p>
                </div>
              )}

              {/* Comments List */}
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-400 text-sm">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-400 text-sm">No comments yet</p>
                </div>
              ) : (
                <>
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
                  {hasMoreComments && (
                    <div className="flex justify-center pt-6">
                      <Button
                        onClick={loadMoreComments}
                        disabled={loadingMoreComments}
                        variant="outline"
                        className="bg-[#1a1a1a] border-gray-700 text-white hover:bg-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingMoreComments ? "Loading..." : "See more"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Related Videos Sidebar */}
          <aside className="md:col-span-4 col-span-12">
            <h4 className="text-white font-semibold mb-4 px-2">
              Related Videos
            </h4>
            {relatedVideosLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-400 text-sm">
                  Loading related videos...
                </p>
              </div>
            ) : relatedVideos.length > 0 ? (
              <div className="space-y-2">
                {relatedVideos.map((video) => (
                  <RelatedVideos key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-400 text-sm">No related videos found</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;
