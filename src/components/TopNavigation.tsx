"use client";

import { Bell, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useContext, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { useAppSelector } from "@/store/hooks";
import ProfileDropdown from "@/components/ProfileDropdown";

const TopNavigation = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const router = useRouter();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (searchInputRef.current) {
      const searchQuery = searchInputRef.current.value;

      setDialogOpen(false);
      router.push(`/search?q=${searchQuery}`);
    }
  };

  const handleMobileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mobileSearchInputRef.current) {
      const searchQuery = mobileSearchInputRef.current.value;

      setMobileSearchOpen(false);
      router.push(`/search?q=${searchQuery}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 md:left-16 w-screen md:w-[calc(100%-4rem)] z-20 bg-[#111111]">
      {/* Mobile: Toggleable Search bar below navbar */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 py-2 border-b border-[#333] animate-in slide-in-from-top">
          <form
            onSubmit={handleMobileSubmit}
            className="flex items-center h-10 w-full relative gap-2"
          >
            <input
              type="search"
              placeholder="Search"
              ref={mobileSearchInputRef}
              autoFocus
              className="px-4 h-full flex-1 bg-[#1a1a1a] text-white placeholder-gray-400 rounded-xl focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="h-full px-4 grid place-content-center cursor-pointer bg-[#1a1a1a] hover:bg-[#444] rounded-xl transition-colors"
            >
              <Search size={20} className="text-white" />
            </button>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="h-full px-4 grid place-content-center cursor-pointer bg-[#1a1a1a] hover:bg-[#444] rounded-xl transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </form>
        </div>
      )}

      <div className="flex justify-between items-center px-4 md:px-8 h-16">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">UniTube</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm font-medium text-white hover:text-purple-400 transition-colors"
            >
              TOP STREAMING
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-white hover:text-purple-400 transition-colors"
            >
              GAMES
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-white hover:text-purple-400 transition-colors"
            >
              TEAMS
            </Link>
          </div>
        </div>

        <div className="md:flex items-center justify-center hidden flex-1 max-w-xl mx-8">
          <form
            onSubmit={handleSubmit}
            className="flex items-center h-10 w-full relative"
          >
            <input
              type="search"
              placeholder="Search"
              ref={searchInputRef}
              className="px-4 h-full w-full bg-[#1a1a1a] text-white placeholder-gray-400 rounded-xl focus:outline-none focus:border-purple-500"
            />
            <div className="h-full px-5 grid place-content-center cursor-pointer bg-[#1a1a1a] hover:bg-[#444] rounded-xl transition-colors absolute right-0">
              <Search size={20} className="text-white" />
            </div>
          </form>
        </div>

        <div className="flex items-center space-x-4">
          {/* Desktop Notifications */}
          <div className="hidden md:block pt-2">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="focus:outline-none">
                <Bell
                  size={24}
                  className="cursor-pointer text-white hover:text-purple-400 transition-colors"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 bg-[#1a1a1a] border-[#333]"
              >
                <DropdownMenuLabel className="text-white font-semibold px-4 py-3 border-b border-[#333]">
                  Notifications
                </DropdownMenuLabel>
                <div className="max-h-96 overflow-y-auto">
                  <DropdownMenuItem className="focus:bg-[#2a2a2a] focus:text-white cursor-pointer px-4 py-3">
                    <div className="flex flex-col space-y-1 w-full">
                      <p className="text-sm text-white">New video uploaded</p>
                      <p className="text-xs text-gray-400">2 hours ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-[#2a2a2a] focus:text-white cursor-pointer px-4 py-3">
                    <div className="flex flex-col space-y-1 w-full">
                      <p className="text-sm text-white">
                        You have a new subscriber
                      </p>
                      <p className="text-xs text-gray-400">5 hours ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-[#2a2a2a] focus:text-white cursor-pointer px-4 py-3">
                    <div className="flex flex-col space-y-1 w-full">
                      <p className="text-sm text-white">
                        Comment on your video
                      </p>
                      <p className="text-xs text-gray-400">1 day ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-[#2a2a2a] focus:text-white cursor-pointer px-4 py-3">
                    <div className="flex flex-col space-y-1 w-full">
                      <p className="text-sm text-white">
                        Video liked by 50 users
                      </p>
                      <p className="text-xs text-gray-400">2 days ago</p>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-[#333]" />
                <DropdownMenuItem className="focus:bg-[#2a2a2a] focus:text-white cursor-pointer px-4 py-3 text-center justify-center">
                  <span className="text-sm text-purple-400 hover:text-purple-300">
                    View all notifications
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile: Search, Notifications and Sign In */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="focus:outline-none"
            >
              <Search
                size={24}
                className={`cursor-pointer transition-colors ${
                  mobileSearchOpen
                    ? "text-purple-400"
                    : "text-white hover:text-purple-400"
                }`}
              />
            </button>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="focus:outline-none">
                <Bell
                  size={24}
                  className="cursor-pointer text-white hover:text-purple-400 transition-colors"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 bg-[#1a1a1a] border-[#333]"
              >
                <DropdownMenuLabel className="text-white font-semibold px-4 py-3 border-b border-[#333]">
                  Notifications
                </DropdownMenuLabel>
                <div className="max-h-96 overflow-y-auto">
                  <DropdownMenuItem className="focus:bg-[#2a2a2a] focus:text-white cursor-pointer px-4 py-3">
                    <div className="flex flex-col space-y-1 w-full">
                      <p className="text-sm text-white">New video uploaded</p>
                      <p className="text-xs text-gray-400">2 hours ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-[#2a2a2a] focus:text-white cursor-pointer px-4 py-3">
                    <div className="flex flex-col space-y-1 w-full">
                      <p className="text-sm text-white">
                        You have a new subscriber
                      </p>
                      <p className="text-xs text-gray-400">5 hours ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-[#2a2a2a] focus:text-white cursor-pointer px-4 py-3">
                    <div className="flex flex-col space-y-1 w-full">
                      <p className="text-sm text-white">
                        Comment on your video
                      </p>
                      <p className="text-xs text-gray-400">1 day ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-[#2a2a2a] focus:text-white cursor-pointer px-4 py-3">
                    <div className="flex flex-col space-y-1 w-full">
                      <p className="text-sm text-white">
                        Video liked by 50 users
                      </p>
                      <p className="text-xs text-gray-400">2 days ago</p>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-[#333]" />
                <DropdownMenuItem className="focus:bg-[#2a2a2a] focus:text-white cursor-pointer px-4 py-3 text-center justify-center">
                  <span className="text-sm text-purple-400 hover:text-purple-300">
                    View all notifications
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isAuthenticated && (
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1.5 h-auto"
              >
                Sign In
              </Button>
            )}
            {isAuthenticated && <ProfileDropdown />}
          </div>

          {/* Desktop: Notifications and Sign In */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Sign In
              </Button>
            ) : (
              <ProfileDropdown />
            )}
          </div>
        </div>
      </div>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </nav>
  );
};

export default TopNavigation;
