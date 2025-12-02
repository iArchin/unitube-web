"use client";

import VideoGrid from "@/components/VideoGrid";
import HeroBanner from "@/components/HeroBanner";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroBanner />
      <VideoGrid />
    </div>
  );
}
