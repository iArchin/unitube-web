"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import ReactPlayer from "react-player";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { fetchVideoDetails, fetchVideos } from "@/lib/api";
import Loading from "../../loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCount } from "@/lib/utils";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import RelatedVideos from "@/components/RelatedVideos";

const VideoDetails = () => {
  const { id } = useParams();

  const [substringCount, setSubstringCount] = useState<undefined | number>(200);
  const [newComment, setNewComment] = useState("");

  const {
    data: videoDetails,
    isLoading: loadingVideoDetails,
    error: errorVideoDetails,
  } = useSWR(`/videoDetails/${id}`, () => fetchVideoDetails(id as string), {
    revalidateOnFocus: false,
  });

  const {
    data: relatedVideos,
    isLoading: loadingRelatedVideos,
    error: errorRelatedVideos,
  } = useSWR("/relatedVideos", () => fetchVideos("all", 5), {
    revalidateOnFocus: false,
  });

  if (errorVideoDetails || errorRelatedVideos) {
    throw new Error("Error fetching video data");
  }

  if (loadingVideoDetails || loadingRelatedVideos) return <Loading />;

  return (
    <div className="mb-9">
      <div className="px-4 h-[80vh] mt-[64px]">
        <ReactPlayer
          url={videoDetails?.videoUrl}
          width="100%"
          height="100%"
          playing={true}
          controls={true}
        />
      </div>

      <div className="p-2 md:p-4 grid grid-cols-12 gap-7">
        <div className="md:col-span-8 col-span-12">
          <div>
            <h3 className="text-xl font-semibold">{videoDetails?.title}</h3>
            <div className="flex justify-between my-3">
              <div className="space-x-3 flex">
                <Avatar>
                  <AvatarImage
                    src={videoDetails?.channelImage}
                    alt={videoDetails?.title}
                  />
                  <AvatarFallback>VD</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-gray-400 text-sm">
                    {videoDetails?.channelName}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {formatCount(+videoDetails!.subscribersCount)} subscribers
                  </p>
                </div>
              </div>
              <div className="flex space-x-4 text-sm items-center bg-gray-600 text-white px-2 md:px-5 rounded-3xl">
                <button className="flex items-center space-x-2 hover:text-blue-500">
                  <ThumbsUp className="w-6" />
                  <span className="text-[14px]">
                    {formatCount(videoDetails?.likes)}
                  </span>
                </button>
                <span>|</span>
                <button className="flex items-center hover:text-red-500">
                  <ThumbsDown className="w-6" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-3 bg-gray-600 text-white rounded-md my-4">
            <p className="leading-8 text-sm">
              {videoDetails?.description.substring(0, substringCount)}{" "}
              <span
                onClick={
                  substringCount === 200
                    ? () => setSubstringCount(undefined)
                    : () => setSubstringCount(200)
                }
                className="font-medium cursor-pointer text-sm underline text-blue-400"
              >
                {substringCount === 200 ? "load more" : "load less"}
              </span>
            </p>
          </div>

          {/* Comments Section */}
          <div className="my-6">
            {/* Add Comment Input */}
            <div className="mb-6">
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewComment(e.target.value)
                    }
                    className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewComment("")}
                      disabled={!newComment.trim()}
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
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-4">Comments</h4>
            <div className="space-y-4">
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">John Doe</p>
                  <p className="text-sm">
                    Great video! Really helpful content.
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center space-x-1 text-xs hover:text-blue-400">
                      <ThumbsUp className="w-3" />
                      <span>12</span>
                    </button>
                    <button className="flex items-center space-x-1 text-xs hover:text-red-400">
                      <ThumbsDown className="w-3" />
                      <span>2</span>
                    </button>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Sarah Miller</p>
                  <p className="text-sm">
                    Thanks for the detailed explanation! This really cleared
                    things up for me.
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center space-x-1 text-xs hover:text-blue-400">
                      <ThumbsUp className="w-3" />
                      <span>8</span>
                    </button>
                    <button className="flex items-center space-x-1 text-xs hover:text-red-400">
                      <ThumbsDown className="w-3" />
                      <span>0</span>
                    </button>
                    <span className="text-xs text-gray-400">5 hours ago</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>MW</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Mike Wilson</p>
                  <p className="text-sm">
                    Awesome tutorial! Can you make more videos on this topic?
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center space-x-1 text-xs hover:text-blue-400">
                      <ThumbsUp className="w-3" />
                      <span>15</span>
                    </button>
                    <button className="flex items-center space-x-1 text-xs hover:text-red-400">
                      <ThumbsDown className="w-3" />
                      <span>1</span>
                    </button>
                    <span className="text-xs text-gray-400">1 day ago</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Anna Lee</p>
                  <p className="text-sm">
                    This is exactly what I was looking for. Bookmarked for
                    future reference!
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center space-x-1 text-xs hover:text-blue-400">
                      <ThumbsUp className="w-3" />
                      <span>6</span>
                    </button>
                    <button className="flex items-center space-x-1 text-xs hover:text-red-400">
                      <ThumbsDown className="w-3" />
                      <span>0</span>
                    </button>
                    <span className="text-xs text-gray-400">2 days ago</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>RB</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Robert Brown</p>
                  <p className="text-sm">
                    Clear and concise. The examples really helped me understand
                    the concepts better.
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center space-x-1 text-xs hover:text-blue-400">
                      <ThumbsUp className="w-3" />
                      <span>9</span>
                    </button>
                    <button className="flex items-center space-x-1 text-xs hover:text-red-400">
                      <ThumbsDown className="w-3" />
                      <span>0</span>
                    </button>
                    <span className="text-xs text-gray-400">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="md:col-span-4 col-span-12">
          {relatedVideos?.map((video) => (
            <RelatedVideos key={video.id} video={video} />
          ))}
        </aside>
      </div>
    </div>
  );
};

export default VideoDetails;
