import Link from "next/link";
import Image from "next/image";
import { Dot } from "lucide-react";

import { Video } from "../../types/custom_types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCount, formatPublishedDate } from "@/lib/utils";

const HorizontalThumbnail = ({ video }: { video: Video }) => {
  // Build URL with download_link as query parameter if available
  const watchUrl = video.download_link
    ? `/watch/${video.id}?url=${encodeURIComponent(video.download_link)}`
    : `/watch/${video.id}`;

  return (
    <Link 
      href={watchUrl} 
      className="w-[280px] flex-shrink-0"
      draggable="false"
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="h-40 overflow-hidden rounded-xl select-none">
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
      <div className="flex space-x-2 py-2">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={video.channel.channelImage}
            alt={video.channel.channelTitle}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
          <AvatarFallback className="text-xs">AB</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1">
          <h4 className="text-sm font-semibold tracking-tight line-clamp-2 leading-tight">
            {video.title.substring(0, 60)}
          </h4>
          <p className="text-xs text-background-dark dark:text-background-light">
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
      </div>
    </Link>
  );
};

export default HorizontalThumbnail;
