import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import HorizontalThumbnail from "./HorizontalThumbnail";
import { Video } from "../../types/custom_types";

interface VideoRowProps {
  title: string;
  videos: Video[];
  onViewAll?: () => void;
}

const VideoRow = ({ title, videos, onViewAll }: VideoRowProps) => {
  return (
    <div className="mb-8">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <Button
          variant="ghost"
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
          onClick={onViewAll}
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Horizontal Scrollable Row */}
      <div className="relative px-2">
        <div className="flex overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-4">
            {videos.map((video) => (
              <HorizontalThumbnail key={video.id} video={video} />
            ))}
          </div>
        </div>
        {/* Fade effect on the right side */}
        <div className="absolute right-2 top-0 bottom-4 w-32 pointer-events-none z-10 bg-gradient-to-l from-[#111111] via-[#111111]/60 to-transparent" />
      </div>
    </div>
  );
};

export default VideoRow;
