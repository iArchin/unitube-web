"use client";

import { Dispatch, SetStateAction } from "react";

import { Badge } from "@/components/ui/badge";

export function SearchBadge({
  badges,
  setBadge,
  currentBadge,
}: {
  badges: string[];
  setBadge: Dispatch<SetStateAction<string>>;
  currentBadge: string;
}) {
  return badges.map((badge) => (
    <Badge
      key={badge}
      onClick={() => setBadge(badge)}
      className={`mr-4 mt-2 mb-3  text-black dark:text-purple-500 hover:text-white cursor-pointer ${
        badge === currentBadge ? " text-white" : ""
      }`}
    >
      {badge}
    </Badge>
  ));
}
