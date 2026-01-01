"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Home,
  Plus,
  CreditCard,
  Star,
  Settings,
  SquarePlus,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const Sidebar = ({ className }: Props) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<string>("home");

  useEffect(() => {
    if (pathname === "/") {
      setActiveItem("home");
    } else if (pathname.startsWith("/channels")) {
      setActiveItem("channel");
    } else if (pathname.startsWith("/create")) {
      setActiveItem("plus");
    } else if (pathname.startsWith("/subscription")) {
      setActiveItem("credit");
    } else if (pathname.startsWith("/favorites")) {
      setActiveItem("star");
    } else if (pathname.startsWith("/settings")) {
      setActiveItem("settings");
    } else if (
      pathname.startsWith("/top") ||
      pathname.startsWith("/games") ||
      pathname.startsWith("/teams")
    ) {
      setActiveItem("home"); // Top nav pages use home icon
    }
  }, [pathname]);
  return (
    <ScrollArea
      className={cn(
        "h-screen w-16 pt-4 z-40 !fixed hidden md:block top-0 bg-[#111111] text-white translate-x-0 transition-transform duration-500 border-r border-[#333]",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-6">
        <Link href="/" className="mb-4">
          <div className="flex flex-col items-center space-y-1">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 grid grid-cols-2 gap-0.5">
                <div className="w-full h-full bg-purple-500"></div>
                <div className="w-full h-full bg-purple-600"></div>
                <div className="w-full h-full bg-purple-600"></div>
                <div className="w-full h-full bg-purple-500"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center"></div>
            </div>
          </div>
        </Link>
        <Link href="/">
          <Button
            onClick={() => setActiveItem("home")}
            variant="ghost"
            className={cn(
              "w-12 h-12 p-0 flex justify-center items-center transition-colors rounded-lg",
              activeItem === "home"
                ? " text-purple-400"
                : "text-gray-400  hover:text-white"
            )}
          >
            <Home size={24} />
          </Button>
        </Link>
        <Link href="/create">
          <Button
            onClick={() => setActiveItem("plus")}
            variant="ghost"
            className={cn(
              "w-12 h-12 p-0 flex justify-center items-center transition-colors rounded-lg relative",
              activeItem === "plus"
                ? " text-purple-400"
                : "text-gray-400  hover:text-white"
            )}
          >
            <div className="relative">
              {/* <div className="absolute inset-0 border-2 border-current rounded-sm opacity-50"></div> */}
              <SquarePlus size={24} className="relative" />
            </div>
          </Button>
        </Link>
        <Link href="/subscription">
          <Button
            onClick={() => setActiveItem("credit")}
            variant="ghost"
            className={cn(
              "w-12 h-12 p-0 flex justify-center items-center transition-colors rounded-lg",
              activeItem === "credit"
                ? " text-purple-400"
                : "text-gray-400  hover:text-white"
            )}
          >
            <Crown size={24} />
          </Button>
        </Link>
        <Link href="/favorites">
          <Button
            onClick={() => setActiveItem("star")}
            variant="ghost"
            className={cn(
              "w-12 h-12 p-0 flex justify-center items-center transition-colors rounded-lg",
              activeItem === "star"
                ? " text-purple-400"
                : "text-gray-400  hover:text-white"
            )}
          >
            <Star size={24} />
          </Button>
        </Link>
        <Link href="/settings">
          <Button
            onClick={() => setActiveItem("settings")}
            variant="ghost"
            className={cn(
              "w-12 h-12 p-0 flex justify-center items-center transition-colors rounded-lg",
              activeItem === "settings"
                ? " text-purple-400"
                : "text-gray-400  hover:text-white"
            )}
          >
            <Settings size={24} />
          </Button>
        </Link>
      </div>
    </ScrollArea>
  );
};

export default Sidebar;
