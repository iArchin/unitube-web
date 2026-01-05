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
      <div className="h-[320px] overflow-hidden rounded-xl select-none">
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={500}
          height={500}
          draggable={false}
          className="w-full h-full object-cover hover:scale-105 transition-all duration-300 select-none"
          onDragStart={(e) => e.preventDefault()}
        />
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
          <p className="text-xs">
            {formatPublishedDate(video.publishedDate)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default VerticalThumbnail;

