"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCount, formatPublishedDate } from "@/lib/utils";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import RelatedVideos from "@/components/RelatedVideos";
import { generateMockVideos } from "@/lib/mockData";
import { Video } from "../../../../../types/custom_types";
import { Button } from "@/components/ui/button";

// Dynamically import react-player to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player/youtube"), {
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
  const [isMounted, setIsMounted] = useState(false);
  const [substringCount, setSubstringCount] = useState<undefined | number>(200);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use default video data instead of API
  const videoDetails = getDefaultVideo(id);

  // Generate related videos using mock data
  const relatedVideos = generateMockVideos(8, "trending");

  // Default YouTube video ID for the player
  const defaultVideoId = "dQw4w9WgXcQ";

  return (
    <div className="min-h-screen bg-[#111111] pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="grid grid-cols-12 gap-4 md:gap-7">
          {/* Main Video Section */}
          <div className="md:col-span-8 col-span-12">
            {/* Video Player */}
            <div className="w-full mb-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                {isMounted && (
                  <ReactPlayer
                    url={`https://www.youtube.com/watch?v=${defaultVideoId}`}
                    width="100%"
                    height="100%"
                    playing={false}
                    controls={true}
                    config={{
                      playerVars: {
                        modestbranding: 1,
                        rel: 0,
                      },
                    }}
                  />
                )}
              </div>
            </div>

            {/* Video Info */}
            <div className="mb-4">
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
                {videoDetails.title}
              </h3>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={videoDetails.channel.channelImage}
                      alt={videoDetails.channel.channelTitle}
                    />
                    <AvatarFallback>VD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-white text-sm font-medium">
                      {videoDetails.channel.channelTitle}
                    </h4>
                    <p className="text-gray-400 text-xs">
                      {formatCount(Math.floor(Math.random() * 1000000))}{" "}
                      subscribers
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4 text-sm items-center bg-[#1a1a1a] text-white px-3 md:px-5 py-2 rounded-3xl">
                  <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-sm">
                      {formatCount(Math.floor(Math.random() * 50000))}
                    </span>
                  </button>
                  <span className="text-gray-600">|</span>
                  <button className="flex items-center hover:text-red-500 transition-colors">
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-[#1a1a1a] text-white rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">
                  {formatCount(+videoDetails.viewCount)} views •{" "}
                  {formatPublishedDate(videoDetails.publishedDate)}
                </span>
              </div>
              <p className="leading-6 text-sm text-gray-300">
                {videoDetails.description.substring(
                  0,
                  substringCount || videoDetails.description.length
                )}
                {substringCount &&
                  substringCount < videoDetails.description.length &&
                  "..."}
                {videoDetails.description.length > 200 && (
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
                {defaultComments.length} Comments
              </h4>

              {/* Add Comment Input */}
              <div className="mb-6">
                <div className="flex space-x-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-blue-500 text-white">
                      AB
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
                        onClick={() => {
                          // TODO: Implement comment submission
                          console.log("Comment submitted:", newComment);
                          setNewComment("");
                        }}
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
                {defaultComments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-gray-600 text-white">
                        {comment.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-1">
                        <p className="font-semibold text-sm text-white">
                          {comment.author}
                        </p>
                        <span className="text-xs text-gray-400">
                          {comment.timeAgo}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2 leading-relaxed">
                        {comment.text}
                      </p>
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-xs hover:text-blue-400 transition-colors text-gray-400">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{formatCount(comment.likes)}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-xs hover:text-red-400 transition-colors text-gray-400">
                          <ThumbsDown className="w-4 h-4" />
                          {comment.dislikes > 0 && (
                            <span>{comment.dislikes}</span>
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
