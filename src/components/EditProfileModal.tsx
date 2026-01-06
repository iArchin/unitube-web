"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateName, updateBio, updateProfileImage } from "@/lib/api";
import { updateUser } from "@/store/authSlice";
import { Loader2, Camera, X } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileModal = ({ open, onOpenChange }: EditProfileModalProps) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio_description || "");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.profile_image || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setBio(user.bio_description || "");
      setPreviewUrl(user.profile_image);
      setImage(null);
      setError(null);
    }
  }, [open, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    if (!token || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Update Name if changed
      if (name !== user.name) {
        const updatedUser = await updateName(name, token);
        if (updatedUser) dispatch(updateUser({ name: updatedUser.name }));
      }

      // 2. Update Bio if changed
      if (bio !== (user.bio_description || "")) {
        const updatedUser = await updateBio(bio, token);
        if (updatedUser)
          dispatch(
            updateUser({ bio_description: updatedUser.bio_description })
          );
      }

      // 3. Update Image if changed
      if (image) {
        const updatedUser = await updateProfileImage(image, token);
        if (updatedUser)
          dispatch(updateUser({ profile_image: updatedUser.profile_image }));
      }

      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-[#333]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-2 border-purple-500">
              <AvatarImage src={previewUrl || undefined} />
              <AvatarFallback className="text-2xl bg-purple-500">
                {getInitials(name || user?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="profile-image-upload"
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <Camera className="w-8 h-8 text-white" />
            </label>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-400"
              >
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#2a2a2a] border-[#333] text-white focus:ring-purple-500"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="bio"
                className="text-sm font-medium text-gray-400"
              >
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full bg-[#2a2a2a] border-[#333] text-white rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none text-sm border"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center w-full">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white hover:bg-[#333]"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 text-white min-w-[100px]"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
