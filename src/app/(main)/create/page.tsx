"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Video,
  Image as ImageIcon,
  Link2,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  uploadVideo,
  UploadVideoData,
  fetchAllCategories,
  Category,
} from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    file: File | null;
  }>({
    title: "",
    description: "",
    category: "",
    file: null,
  });

  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  // Fetch categories when dialog opens and user is authenticated
  useEffect(() => {
    if (isUploadDialogOpen && isAuthenticated && token) {
      fetchCategories();
    }
  }, [isUploadDialogOpen, isAuthenticated, token]);

  const fetchCategories = async () => {
    if (!token) return;

    setLoadingCategories(true);
    try {
      const fetchedCategories = await fetchAllCategories(token);
      setCategories(fetchedCategories);
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
      setUploadError("Failed to load categories. Please try again.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      file: null,
    });
    setUploadError(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    // Reset file input
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsUploadDialogOpen(open);
    if (!open) {
      // Reset form when dialog closes
      resetForm();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("video/")) {
        setUploadError("Please select a valid video file");
        return;
      }
      // Validate file size (e.g., max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        setUploadError("File size must be less than 500MB");
        return;
      }
      setFormData({ ...formData, file });
      setUploadError(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadProgress(0);
    setUploadSuccess(false);

    if (!isAuthenticated || !token) {
      setUploadError("Please log in to upload videos");
      return;
    }

    if (!formData.file) {
      setUploadError("Please select a video file");
      return;
    }

    if (!formData.category) {
      setUploadError("Please select a category");
      return;
    }

    setIsUploading(true);

    try {
      const uploadData: UploadVideoData = {
        title: formData.title,
        description: formData.description,
        video_type: "long", // Always set to "long" as per requirements
        category_id: formData.category,
        file: formData.file,
      };

      const response = await uploadVideo(uploadData, token, (progress) => {
        setUploadProgress(progress);
      });

      // Check if status is 201
      if (response.status === 201) {
        setUploadSuccess(true);
        setIsUploading(false);

        // Wait a bit to show success message, then reset and close
        setTimeout(() => {
          resetForm();
          setIsUploadDialogOpen(false);
          router.refresh();
        }, 2000);
      } else {
        // Reset form and close dialog for other success statuses
        resetForm();
        setIsUploadDialogOpen(false);
        router.refresh();
      }

      console.log("Video uploaded successfully:", response);
    } catch (error: any) {
      setUploadError(
        error.message || "Failed to upload video. Please try again."
      );
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Create Content
        </h1>
        <p className="text-gray-400 mb-8">
          Upload and share your videos with the world
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Video Card */}
          <Dialog open={isUploadDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#333] hover:border-purple-500 transition-colors cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                    <Video className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Upload Video
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Share your video content
                  </p>
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Video
                  </Button>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-[#333] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Upload Video</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Fill in the details below to upload your video
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium text-white"
                  >
                    Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter video title"
                    required
                    className="bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-white"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter video description"
                    required
                    rows={4}
                    className="flex w-full rounded-md border border-[#444] bg-[#2a2a2a] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="category"
                    className="text-sm font-medium text-white"
                  >
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    disabled={loadingCategories}
                    className="flex w-full rounded-md border border-[#444] bg-[#2a2a2a] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      {loadingCategories
                        ? "Loading categories..."
                        : "Select a category"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name || category.title || category.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="file"
                    className="text-sm font-medium text-white"
                  >
                    Video File *
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#444] border-dashed rounded-lg cursor-pointer bg-[#2a2a2a] hover:bg-[#333] transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            MP4, AVI, MOV, etc. (MAX. 500MB)
                          </p>
                        </div>
                        <input
                          id="file"
                          name="file"
                          type="file"
                          accept="video/*"
                          onChange={handleFileChange}
                          required
                          className="hidden"
                        />
                      </label>
                    </div>
                    {formData.file && (
                      <div className="p-3 rounded-md bg-[#2a2a2a] border border-[#444]">
                        <p className="text-sm text-white font-medium">
                          {formData.file.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {isUploading && !uploadSuccess && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium">
                        Uploading...
                      </span>
                      <span className="text-gray-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#2a2a2a] rounded-full h-2.5 border border-[#444]">
                      <div
                        className="bg-purple-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-4 rounded-md bg-green-500/20 border border-green-500/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-green-400 font-medium text-sm">
                          Upload Complete!
                        </p>
                        <p className="text-green-300/80 text-xs mt-1">
                          Your video has been successfully uploaded.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 rounded-md bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                    {uploadError}
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="p-3 rounded-md bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-sm">
                    Please log in to upload videos
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogChange(false)}
                    disabled={isUploading}
                    className="border-[#444] text-white hover:bg-[#2a2a2a]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading || !isAuthenticated || uploadSuccess}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : uploadSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Complete
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Video
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Create Short Card */}
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#333] hover:border-purple-500 transition-colors cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Create Short
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Create short-form content
              </p>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Create Short
              </Button>
            </div>
          </div>

          {/* Go Live Card */}
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#333] hover:border-purple-500 transition-colors cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Go Live</h3>
              <p className="text-gray-400 text-sm mb-4">Start a live stream</p>
              <Button className="bg-red-500 hover:bg-red-600 text-white">
                Start Streaming
              </Button>
            </div>
          </div>

          {/* Create Post Card */}
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#333] hover:border-purple-500 transition-colors cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Create Post
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Share updates and thoughts
              </p>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                <Link2 className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
