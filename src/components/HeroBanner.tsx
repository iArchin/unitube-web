"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-player to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player/youtube"), {
  ssr: false,
});

const HeroBanner = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Default YouTube video ID - you can change this to any YouTube video
  const videoId = "dQw4w9WgXcQ"; // Example video ID

  return (
    <div className="w-full px-0 md:px-4 py-2 mb-2 pt-32">
      <div className="flex flex-col md:flex-row items-center gap-8 max-w-7xl mx-auto">
        {/* Left side - Text */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Play, Compete, Follow popular streams
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mt-4">
            Discover the best content from creators around the world
          </p>
        </div>

        {/* Right side - YouTube Video Player */}
        <div className="flex-1 w-full max-w-2xl">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
            {isMounted && (
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${videoId}`}
                width="100%"
                height="100%"
                playing={true}
                muted={true}
                loop={true}
                controls={false}
                config={{
                  playerVars: {
                    autoplay: 1,
                    mute: 1,
                    loop: 1,
                    modestbranding: 1,
                    rel: 0,
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
