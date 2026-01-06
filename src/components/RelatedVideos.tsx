import { Dot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatCount, formatPublishedDate } from "@/lib/utils";
import { Video } from "../../types/custom_types";

const RelatedVideos = ({ video }: { video: Video }) => {
  // Build URL with download_link, title, and description as query parameters
  const params = new URLSearchParams();
  if (video?.download_link) {
    params.append("url", video.download_link);
  }
  if (video?.title) {
    params.append("title", video.title);
  }
  if (video?.description) {
    params.append("description", video.description);
  }
  if (video?.channel.channelTitle) {
    params.append("channel", video.channel.channelTitle);
  }

  const watchUrl = `/watch/${video?.id}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  return (
    <Link href={watchUrl} className="h-32 my-4 flex gap-3 justify-between">
      <div className="flex-1 rounded-2xl overflow-hidden">
        <Image
          src={video.thumbnail}
          alt={video.title}
          height={300}
          width={300}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1">
        <h4 className="text-sm">{video.title.substring(0, 50)}</h4>
        <Link
          href={`/channels/${video.channel.channelId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs my-2 block hover:text-purple-400 transition-colors"
        >
          {video.channel.channelTitle}
        </Link>
        <div className="text-xs flex items-center text-background-light">
          {formatCount(+video.viewCount)} views {<Dot />}{" "}
          {formatPublishedDate(video.created_at)}
        </div>
      </div>
    </Link>
  );
};

export default RelatedVideos;
