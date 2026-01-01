"use client";

import { Bell, Menu, Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useContext, useRef, useState } from "react";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import AppContext from "@/context/appContext";
import { useAppSelector } from "@/store/hooks";

const TopNavigation = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const router = useRouter();

  const { setShowNav } = useContext(AppContext);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (searchInputRef.current) {
      const searchQuery = searchInputRef.current.value;

      setDialogOpen(false);
      router.push(`/search?q=${searchQuery}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 md:left-16 w-screen md:w-[calc(100%-4rem)] z-20 bg-[#111111]">
      <div className="flex justify-between items-center px-4 md:px-8 h-16">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">UniTube</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/top"
              className="text-sm font-medium text-white hover:text-purple-400 transition-colors"
            >
              TOP STREAMING
            </Link>
            <Link
              href="/top?category=gaming"
              className="text-sm font-medium text-white hover:text-purple-400 transition-colors"
            >
              GAMES
            </Link>
            <Link
              href="/top?category=sports"
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
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="focus:outline-none">
              <Bell
                size={24}
                className="cursor-pointer text-white hover:text-purple-400 transition-colors"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[#1a1a1a] border-[#333]">
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
                    <p className="text-sm text-white">You have a new subscriber</p>
                    <p className="text-xs text-gray-400">5 hours ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-[#2a2a2a] focus:text-white cursor-pointer px-4 py-3">
                  <div className="flex flex-col space-y-1 w-full">
                    <p className="text-sm text-white">Comment on your video</p>
                    <p className="text-xs text-gray-400">1 day ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-[#2a2a2a] focus:text-white cursor-pointer px-4 py-3">
                  <div className="flex flex-col space-y-1 w-full">
                    <p className="text-sm text-white">Video liked by 50 users</p>
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
          <div className="md:hidden">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger>
                <Search
                  size={24}
                  onClick={() => setDialogOpen(true)}
                  className="text-white"
                />
              </DialogTrigger>

              <DialogContent className="bg-[#1a1a1a]">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center h-10 mx-auto"
                >
                  <input
                    type="search"
                    placeholder="Search"
                    ref={searchInputRef}
                    className="px-4 h-full md:w-48 lg:w-96 bg-[#111111] text-white placeholder-gray-400 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                  <div className="h-full px-5 grid place-content-center bg-[#333] text-white rounded-r-full">
                    <Search size={24} />
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            {!isAuthenticated && (
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
              >
                Sign In
              </Button>
            )}
            {isAuthenticated && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="w-8 h-8 cursor-pointer border-2 border-purple-500">
                    <AvatarFallback className="bg-purple-500 text-white">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 bg-[#1a1a1a] border-[#333]">
                  <DropdownMenuLabel className="text-white">
                    <div className="flex space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-purple-500 text-white">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col space-y-3 text-base">
                        <span>
                          <p className="text-white">{user?.name || "User"}</p>
                          <p className="text-gray-400">{user?.email}</p>
                        </span>
                        <Link
                          href={`/channels/${process.env.NEXT_PUBLIC_CHANNEL_ID}`}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          View your channel
                        </Link>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Sign In
              </Button>
            ) : (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="w-8 h-8 cursor-pointer border-2 border-purple-500">
                    <AvatarFallback className="bg-purple-500 text-white">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 bg-[#1a1a1a] border-[#333]">
                  <DropdownMenuLabel className="text-white">
                    <div className="flex space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-purple-500 text-white">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col space-y-3 text-base">
                        <span>
                          <p className="text-white">{user?.name || "User"}</p>
                          <p className="text-gray-400">{user?.email}</p>
                        </span>
                        <Link
                          href={`/channels/${process.env.NEXT_PUBLIC_CHANNEL_ID}`}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          View your channel
                        </Link>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </nav>
  );
};

export default TopNavigation;
