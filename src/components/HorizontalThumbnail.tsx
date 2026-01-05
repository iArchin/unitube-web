import Link from "next/link";
import Image from "next/image";
import { Dot } from "lucide-react";

import { Video } from "../../types/custom_types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCount, formatPublishedDate } from "@/lib/utils";

const HorizontalThumbnail = ({ video }: { video: Video }) => {
  // Build URL with download_link, title, and description as query parameters
  const params = new URLSearchParams();
  if (video.download_link) {
    params.append("url", video.download_link);
  }
  if (video.title) {
    params.append("title", video.title);
  }
  if (video.description) {
    params.append("description", video.description);
  }
  if (video.channel.channelTitle) {
    params.append("channel", video.channel.channelTitle);
  }

  const watchUrl = `/watch/${video.id}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  return (
    <Link
      href={watchUrl}
      className="w-[280px] flex-shrink-0"
      draggable="false"
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="h-40 overflow-hidden rounded-xl select-none bg-gray-300 dark:bg-gray-700">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            width={500}
            height={500}
            draggable={false}
            className="w-full h-full object-cover hover:scale-105 transition-all duration-300 select-none"
            onDragStart={(e) => e.preventDefault()}
            onError={(e) => {
              // Hide image on error, showing grey background
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              No thumbnail
            </span>
          </div>
        )}
      </div>
      <div className="flex space-x-2 py-2">
        <Link
          href={`/channels/${video.channel.channelId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        >
          <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 ring-purple-500 transition-all">
            <AvatarImage
              src={video.channel.channelImage}
              alt={video.channel.channelTitle}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
            <AvatarFallback className="text-xs">AB</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col flex-1">
          <h4 className="text-sm font-semibold tracking-tight line-clamp-2 leading-tight">
            {video.title.substring(0, 60)}
          </h4>
          <Link
            href={`/channels/${video.channel.channelId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-background-dark dark:text-background-light hover:text-purple-400 transition-colors"
          >
            {video.channel.channelTitle}
          </Link>
          <div className="flex text-xs dark:text-background-light text-background-dark">
            <p className="text-xs">{formatCount(+video.viewCount)}</p>{" "}
            <Dot className="w-3 h-3" />{" "}
            <p className="text-xs">
              {formatPublishedDate(video.publishedDate)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HorizontalThumbnail;
