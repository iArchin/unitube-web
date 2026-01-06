import Link from "next/link";
import Image from "next/image";
import { Dot } from "lucide-react";

import { Video } from "../../types/custom_types";
import { formatCount, formatPublishedDate } from "@/lib/utils";

const VerticalThumbnail = ({ video }: { video: Video }) => {
  // Shorts videos should navigate to /shorts page with video ID
  const shortsUrl = `/shorts?id=${video.id}`;

  return (
    <Link
      href={shortsUrl}
      className="w-[180px] flex-shrink-0"
      draggable="false"
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="h-[320px] overflow-hidden rounded-xl select-none bg-gray-300 dark:bg-gray-700">
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
      <div className="py-2">
        <h4 className="text-sm font-semibold tracking-tight line-clamp-2 leading-tight mb-1">
          {video.title.substring(0, 60)}
        </h4>
        <p className="text-xs text-background-dark dark:text-background-light mb-1">
          {video.channel.channelTitle}
        </p>
        <div className="flex text-xs dark:text-background-light text-background-dark">
          <p className="text-xs">{formatCount(+video.viewCount)}</p>{" "}
          <Dot className="w-3 h-3" />{" "}
          <p className="text-xs">{formatPublishedDate(video.created_at)}</p>
        </div>
      </div>
    </Link>
  );
};

export default VerticalThumbnail;
