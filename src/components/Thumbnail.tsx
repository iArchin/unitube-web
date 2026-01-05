import Link from "next/link";
import Image from "next/image";
import { Dot } from "lucide-react";

import { Video } from "../../types/custom_types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCount, formatPublishedDate } from "@/lib/utils";

const Thumbnail = ({ video }: { video: Video }) => {
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
    <Link href={watchUrl} className="w-[300px] mx-auto md:w-[300px] my-4">
      <div className="h-44 overflow-hidden rounded-2xl bg-gray-300 dark:bg-gray-700">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            width={500}
            height={500}
            className="w-full h-full object-cover hover:scale-110 transition-all duration-700"
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
      <div className="flex space-x-2 py-3">
        <Avatar>
          <AvatarImage
            src={video.channel.channelImage}
            alt={video.channel.channelTitle}
          />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h4 className="scroll-m-20 text-sm font-bold tracking-tight">
            {video.title.substring(0, 60)}
          </h4>
          <p className="text-xs text-background-dark dark:text-background-light">
            {video.channel.channelTitle}
          </p>
          <div className="flex text-xs dark:text-background-light text-background-dark">
            <p className="text-xs">{formatCount(+video.viewCount)}</p>{" "}
            <Dot className="w-4 h-4" />{" "}
            <p className="text-xs">
              {formatPublishedDate(video.publishedDate)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Thumbnail;
