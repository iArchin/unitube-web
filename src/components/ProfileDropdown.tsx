"use client";

import React from "react";
import Link from "next/link";
import { 
  UserRound, 
  SquarePlay, 
  Users, 
  LogOut, 
  Settings, 
  Moon, 
  Globe, 
  MapPin, 
  Keyboard, 
  HelpCircle, 
  MessageSquare,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";

const ProfileDropdown = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItemClass = "flex items-center gap-3 px-4 py-2.5 focus:bg-[#2a2a2a] focus:text-white cursor-pointer transition-colors";
  const iconClass = "w-5 h-5 text-white";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="w-8 h-8 cursor-pointer border-2 border-purple-500 hover:opacity-80 transition-opacity">
          <AvatarFallback className="bg-purple-500 text-white">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[300px] bg-[#1a1a1a] border-[#333] text-white p-0 overflow-hidden"
      >
        <div className="p-4 flex gap-4 border-b border-[#333]">
          <Avatar className="w-10 h-10 border border-purple-500">
            <AvatarFallback className="bg-purple-500 text-white">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <p className="font-semibold truncate">{user?.name || "User"}</p>
            <p className="text-sm text-gray-400 truncate mb-2">{user?.email}</p>
            <Link
              href={`/channels/${user?.id || ""}`}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              View your channel
            </Link>
          </div>
        </div>

        <div className="py-2">
          <DropdownMenuItem className={menuItemClass} asChild>
            <Link href={`/channels/${user?.id || ""}`}>
              <UserRound className={iconClass} />
              <span className="flex-1">Your channel</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className={menuItemClass}>
            <SquarePlay className={iconClass} />
            <span className="flex-1">UniTube Studio</span>
          </DropdownMenuItem>
          <DropdownMenuItem className={menuItemClass}>
            <Users className={iconClass} />
            <span className="flex-1 text-left">Switch account</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </DropdownMenuItem>
          <DropdownMenuItem className={menuItemClass} onClick={handleLogout}>
            <LogOut className={iconClass} />
            <span className="flex-1">Sign out</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-[#333]" />

        <div className="py-2">
          <DropdownMenuItem className={menuItemClass} asChild>
            <Link href="/settings">
              <Settings className={iconClass} />
              <span className="flex-1">Settings</span>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-[#333]" />

        <div className="py-2">
          <DropdownMenuItem className={menuItemClass}>
            <Moon className={iconClass} />
            <span className="flex-1 text-left">Appearance: Device theme</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </DropdownMenuItem>
          <DropdownMenuItem className={menuItemClass}>
            <Globe className={iconClass} />
            <span className="flex-1 text-left">Language: English</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </DropdownMenuItem>
          <DropdownMenuItem className={menuItemClass}>
            <MapPin className={iconClass} />
            <span className="flex-1 text-left">Location: United States</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </DropdownMenuItem>
          <DropdownMenuItem className={menuItemClass}>
            <Keyboard className={iconClass} />
            <span className="flex-1">Keyboard shortcuts</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-[#333]" />

        <div className="py-2">
          <DropdownMenuItem className={menuItemClass}>
            <HelpCircle className={iconClass} />
            <span className="flex-1">Help</span>
          </DropdownMenuItem>
          <DropdownMenuItem className={menuItemClass}>
            <MessageSquare className={iconClass} />
            <span className="flex-1">Send feedback</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;

