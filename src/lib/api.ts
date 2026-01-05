import axios from "axios";

import { Video } from "../../types/custom_types";

const BASE_URL = "https://www.googleapis.com/youtube/v3";
const API_KEY = "AIzaSyDOod1ml2vPX_4wXL_xWhYZ-w9HHwwdzFo";

// Custom error classes for better error handling
export class YouTubeAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiError?: any
  ) {
    super(message);
    this.name = "YouTubeAPIError";
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Utility function to handle API errors
function handleAPIError(error: any, context: string): never {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const apiError = error.response?.data?.error;

    if (statusCode === 403) {
      throw new YouTubeAPIError(
        `YouTube API quota exceeded or access forbidden for ${context}`,
        statusCode,
        apiError
      );
    }

    if (statusCode === 400) {
      throw new YouTubeAPIError(
        `Invalid request parameters for ${context}: ${
          apiError?.message || error.message
        }`,
        statusCode,
        apiError
      );
    }

    if (statusCode === 404) {
      throw new YouTubeAPIError(
        `Resource not found for ${context}`,
        statusCode,
        apiError
      );
    }

    if (statusCode && statusCode >= 500) {
      throw new YouTubeAPIError(
        `YouTube API server error for ${context}`,
        statusCode,
        apiError
      );
    }

    throw new YouTubeAPIError(
      `YouTube API error in ${context}: ${error.message}`,
      statusCode,
      apiError
    );
  }

  if (error.code === "ECONNABORTED" || error.code === "ENOTFOUND") {
    throw new NetworkError(
      `Network error in ${context}: ${error.message}`,
      error
    );
  }

  throw new YouTubeAPIError(
    `Unexpected error in ${context}: ${error.message}`,
    undefined,
    error
  );
}

// Utility function to validate API response
function validateAPIResponse(data: any, context: string): void {
  if (!data) {
    throw new ValidationError(`Empty response received from ${context}`);
  }

  if (data.error) {
    throw new YouTubeAPIError(
      `API error in ${context}: ${data.error.message}`,
      data.error.code,
      data.error
    );
  }

  if (!data.items || !Array.isArray(data.items)) {
    throw new ValidationError(
      `Invalid response structure from ${context}: missing or invalid items array`
    );
  }

  if (data.items.length === 0) {
    throw new ValidationError(`No items found in ${context}`);
  }
}

export async function fetchVideos(
  query: string,
  maxResult: number
): Promise<Video[]> {
  if (!query?.trim()) {
    throw new ValidationError("Search query cannot be empty");
  }

  if (maxResult < 1 || maxResult > 50) {
    throw new ValidationError("maxResult must be between 1 and 50");
  }

  try {
    const { data } = await axios.get(
      `${BASE_URL}/search?key=${API_KEY}&q=${encodeURIComponent(
        query
      )}&order=date&maxResults=${maxResult}&type=video&part=snippet`,
      { timeout: 10000 }
    );

    validateAPIResponse(data, "video search");

    const videos: Video[] = [];

    for (const video of data.items) {
      try {
        // Validate video item structure
        if (!video.id?.videoId || !video.snippet) {
          console.warn(`Skipping invalid video item: ${JSON.stringify(video)}`);
          continue;
        }

        const videoId = video.id.videoId;
        const videoTitle = video.snippet.title || "Untitled Video";
        const videoDescription = video.snippet.description || "";
        const videoThumbnail =
          video.snippet.thumbnails?.medium?.url ||
          video.snippet.thumbnails?.default?.url ||
          "";
        const channelId = video.snippet.channelId;
        const publishedDate = video.snippet.publishedAt;

        // Fetch video statistics
        let viewCount = "0";
        try {
          const videoDetailsUrl = `${BASE_URL}/videos?key=${API_KEY}&id=${videoId}&part=snippet,statistics`;
          const { data: videoData } = await axios.get(videoDetailsUrl, {
            timeout: 10000,
          });

          if (videoData.items?.[0]?.statistics?.viewCount) {
            viewCount = videoData.items[0].statistics.viewCount;
          }
        } catch (statsError) {
          console.warn(
            `Failed to fetch statistics for video ${videoId}:`,
            statsError
          );
          // Continue with default viewCount
        }

        // Fetch channel details
        let channelTitle = "Unknown Channel";
        let channelImage = "";

        try {
          const channelDetailsUrl = `${BASE_URL}/channels?key=${API_KEY}&id=${channelId}&part=snippet`;
          const { data: channelData } = await axios.get(channelDetailsUrl, {
            timeout: 10000,
          });

          if (channelData.items?.[0]?.snippet) {
            channelTitle = channelData.items[0].snippet.title || channelTitle;
            channelImage =
              channelData.items[0].snippet.thumbnails?.medium?.url ||
              channelData.items[0].snippet.thumbnails?.default?.url ||
              "";
          }
        } catch (channelError) {
          console.warn(
            `Failed to fetch channel details for ${channelId}:`,
            channelError
          );
          // Continue with default channel info
        }

        videos.push({
          id: videoId,
          title: videoTitle,
          description: videoDescription,
          thumbnail: videoThumbnail,
          viewCount,
          channel: {
            channelId,
            channelTitle,
            channelImage,
          },
          publishedDate,
        });
      } catch (videoError) {
        console.warn(`Failed to process video item:`, videoError);
        // Continue processing other videos
        continue;
      }
    }

    return videos;
  } catch (error) {
    handleAPIError(error, "fetchVideos");
  }
}

export async function fetchVideoDetails(videoId: string) {
  if (!videoId?.trim()) {
    throw new ValidationError("Video ID cannot be empty");
  }

  try {
    const { data } = await axios.get(
      `${BASE_URL}/videos?key=${API_KEY}&id=${encodeURIComponent(
        videoId
      )}&part=snippet,statistics`,
      { timeout: 10000 }
    );

    validateAPIResponse(data, "video details");

    const videoItem = data.items[0];
    const videoData = videoItem.snippet;

    if (!videoData) {
      throw new ValidationError("Invalid video data structure");
    }

    const channelData = await fetchChannelDetails(videoData.channelId);

    const videoDetails = {
      title: videoData.title || "Untitled Video",
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      likes: videoItem.statistics?.likeCount || "0",
      description: videoData.description || "",
      publishedDate: videoData.publishedAt,
      channelImage: channelData.channelImage,
      channelName: channelData.channelName,
      subscribersCount: channelData.subscribersCount,
    };

    return videoDetails;
  } catch (error) {
    handleAPIError(error, "fetchVideoDetails");
  }
}

async function fetchChannelDetails(channelId: string): Promise<{
  channelName: string;
  subscribersCount: string;
  channelImage: string;
}> {
  if (!channelId?.trim()) {
    throw new ValidationError("Channel ID cannot be empty");
  }

  try {
    const { data } = await axios.get(
      `${BASE_URL}/channels?key=${API_KEY}&id=${encodeURIComponent(
        channelId
      )}&part=snippet,statistics`,
      { timeout: 10000 }
    );

    validateAPIResponse(data, "channel details");

    const channelItem = data.items[0];
    const snippet = channelItem.snippet;
    const statistics = channelItem.statistics;

    if (!snippet) {
      throw new ValidationError(
        "Invalid channel data structure: missing snippet"
      );
    }

    const channelDetails = {
      channelName: snippet.title || "Unknown Channel",
      subscribersCount: statistics?.subscriberCount || "0",
      channelImage:
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url ||
        "",
    };

    return channelDetails;
  } catch (error) {
    handleAPIError(error, "fetchChannelDetails");
  }
}

export async function fetchChannel(channelId: string) {
  if (!channelId?.trim()) {
    throw new ValidationError("Channel ID cannot be empty");
  }

  try {
    const { data } = await axios.get(
      `${BASE_URL}/channels?key=${API_KEY}&id=${encodeURIComponent(
        channelId
      )}&part=snippet`,
      { timeout: 10000 }
    );

    validateAPIResponse(data, "channel fetch");

    const channelData = data.items[0];

    return channelData;
  } catch (error) {
    handleAPIError(error, "fetchChannel");
  }
}

export async function fetchChannelVideos(channelId: string) {
  if (!channelId?.trim()) {
    throw new ValidationError("Channel ID cannot be empty");
  }

  try {
    const channelPlaylistId = await fetchChannelPlaylistId(channelId);

    if (!channelPlaylistId) {
      throw new ValidationError("Could not retrieve channel playlist ID");
    }

    const { data } = await axios.get(
      `${BASE_URL}/playlistItems?key=${API_KEY}&playlistId=${encodeURIComponent(
        channelPlaylistId
      )}&part=snippet&maxResults=50`,
      { timeout: 10000 }
    );

    validateAPIResponse(data, "channel videos");

    return data.items;
  } catch (error) {
    handleAPIError(error, "fetchChannelVideos");
  }
}

export async function fetchChannelPlaylistId(
  channelId: string
): Promise<string> {
  if (!channelId?.trim()) {
    throw new ValidationError("Channel ID cannot be empty");
  }

  try {
    const { data } = await axios.get(
      `${BASE_URL}/channels?key=${API_KEY}&id=${encodeURIComponent(
        channelId
      )}&part=contentDetails`,
      { timeout: 10000 }
    );

    validateAPIResponse(data, "channel playlist ID");

    const channelItem = data.items[0];

    if (!channelItem.contentDetails?.relatedPlaylists?.uploads) {
      throw new ValidationError("Channel playlist ID not found in response");
    }

    return channelItem.contentDetails.relatedPlaylists.uploads;
  } catch (error) {
    handleAPIError(error, "fetchChannelPlaylistId");
  }
}

export async function fetchSearchQuery(searchQuery: string) {
  if (!searchQuery?.trim()) {
    throw new ValidationError("Search query cannot be empty");
  }

  try {
    const { data } = await axios.get(
      `${BASE_URL}/search?q=${encodeURIComponent(
        searchQuery
      )}&part=snippet&type=video&maxResults=10&key=${API_KEY}`,
      { timeout: 10000 }
    );

    validateAPIResponse(data, "search query");

    return data;
  } catch (error) {
    handleAPIError(error, "fetchSearchQuery");
  }
}

export async function fetchVideosByCategory(
  category: string,
  maxResult: number
): Promise<Video[]> {
  if (!category?.trim()) {
    throw new ValidationError("Category cannot be empty");
  }

  if (maxResult < 1 || maxResult > 50) {
    throw new ValidationError("maxResult must be between 1 and 50");
  }

  // Map category names to appropriate search queries
  const categoryQueries: Record<string, string> = {
    trending: "trending",
    sports: "sports highlights",
    music: "music videos",
    gaming: "gaming",
    news: "news",
    technology: "technology",
    entertainment: "entertainment",
    education: "educational content",
    science: "science",
    comedy: "comedy",
  };

  const searchQuery = categoryQueries[category.toLowerCase()] || category;

  // Use the existing fetchVideos function with the category-specific query
  return fetchVideos(searchQuery, maxResult);
}

export interface Category {
  id: string;
  name: string;
  [key: string]: any;
}

export async function fetchAllCategories(
  token: string
): Promise<Category[]> {
  if (!token?.trim()) {
    throw new ValidationError("Authentication token is required");
  }

  try {
    const { data } = await axios.get(
      "https://api.unitribe.app/ut/api/all-category",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    // Handle different possible response structures
    if (Array.isArray(data)) {
      return data;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data.categories && Array.isArray(data.categories)) {
      return data.categories;
    }

    throw new ValidationError("Invalid category response structure");
  } catch (error) {
    handleAPIError(error, "fetchAllCategories");
  }
}

// API response types for categories with videos
export interface CategoryVideoResponse {
  id: number;
  title: string;
  description: string;
  slug: string;
  videos: Array<{
    id: number;
    title: string;
    description: string;
    download_link: string | null;
    poster: string | null;
    category_id: number;
    user_id: number;
    category: {
      id: number;
      title: string;
      description: string;
      slug: string;
    };
  }>;
}

export interface CategoriesVideosResponse {
  data: CategoryVideoResponse[];
  meta: {
    current_page: number;
    next_page: number | null;
    per_page: number;
    total_videos: number;
  };
}

export interface CategoryWithVideos {
  id: number;
  title: string;
  description: string;
  slug: string;
  videos: Video[];
}

/**
 * Fetches categories with their videos from the unitribe API
 * @param token - Authentication token (required)
 * @param page - Page number (default: 1)
 * @param size - Number of categories per page (default: 10)
 * @returns Array of categories with their videos transformed to Video type
 */
/**
 * Fetches a single video by ID from the unitribe API
 * @param videoId - Video ID (required)
 * @param token - Authentication token (required)
 * @returns Video data
 */
export async function fetchVideoById(
  videoId: string,
  token: string
): Promise<Video> {
  if (!videoId?.trim()) {
    throw new ValidationError("Video ID cannot be empty");
  }

  if (!token?.trim()) {
    throw new ValidationError("Authentication token is required");
  }

  try {
    const { data } = await axios.get(
      `https://api.unitribe.app/ut/api/videos/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    const video = data.data || data;

    if (!video) {
      throw new ValidationError("Video not found");
    }

    // Helper function to generate random view count
    const getRandomViewCount = (): string => {
      const views = Math.floor(Math.random() * 10000000) + 100;
      return views.toString();
    };

    // Helper function to generate random date (within last 2 years)
    const getRandomDate = (): string => {
      const now = new Date();
      const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
      const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
      return new Date(randomTime).toISOString();
    };

    // Use poster image for thumbnail, fallback to placeholder if not available
    const thumbnail = video.poster || 
      `https://via.placeholder.com/320x180/6366f1/ffffff?text=${encodeURIComponent((video.title || "Video").substring(0, 30))}`;

    return {
      id: video.id.toString(),
      title: video.title || "Untitled Video",
      description: video.description || "",
      thumbnail,
      viewCount: getRandomViewCount(),
      channel: {
        channelId: video.user_id?.toString() || "0",
        channelTitle: "User Channel",
        channelImage: `https://via.placeholder.com/40x40/6366f1/ffffff?text=U${video.user_id || "0"}`,
      },
      publishedDate: getRandomDate(),
      download_link: video.download_link || null,
    } as Video;
  } catch (error) {
    handleAPIError(error, "fetchVideoById");
  }
}

export async function fetchCategoriesWithVideos(
  token: string,
  page: number = 1,
  size: number = 10
): Promise<CategoryWithVideos[]> {
  if (!token?.trim()) {
    throw new ValidationError("Authentication token is required");
  }

  try {
    const { data } = await axios.get<CategoriesVideosResponse>(
      `https://api.unitribe.app/ut/api/categories/videos`,
      {
        params: {
          page,
          size,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    if (!data || !data.data || !Array.isArray(data.data)) {
      throw new ValidationError("Invalid response structure from categories/videos API");
    }

    // Helper function to generate random view count
    const getRandomViewCount = (): string => {
      const views = Math.floor(Math.random() * 10000000) + 100; // Random between 100 and 10,000,100
      return views.toString();
    };

    // Helper function to generate random date (within last 2 years)
    const getRandomDate = (): string => {
      const now = new Date();
      const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
      const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
      return new Date(randomTime).toISOString();
    };

    // Transform API response to CategoryWithVideos format
    return data.data.map((category) => ({
      id: category.id,
      title: category.title,
      description: category.description,
      slug: category.slug,
      videos: category.videos
        // Filter out videos with null download_link
        .filter((video) => video.download_link !== null)
        .map((video) => {
          // Use poster image for thumbnail, fallback to placeholder if not available
          const thumbnail = video.poster || 
            `https://via.placeholder.com/320x180/6366f1/ffffff?text=${encodeURIComponent(video.title.substring(0, 30))}`;

          return {
            id: video.id.toString(),
            title: video.title || "Untitled Video",
            description: video.description || "",
            thumbnail,
            viewCount: getRandomViewCount(),
            channel: {
              channelId: video.user_id.toString(),
              channelTitle: "User Channel", // API doesn't provide channel name
              channelImage: `https://via.placeholder.com/40x40/6366f1/ffffff?text=U${video.user_id}`, // Placeholder
            },
            publishedDate: getRandomDate(),
            download_link: video.download_link,
          } as Video;
        }),
    }));
  } catch (error) {
    handleAPIError(error, "fetchCategoriesWithVideos");
  }
}

export interface ShortVideoResponse {
  current_page: number;
  data: Array<{
    id: number;
    video_type: string;
    category_id: number;
    poster: string | null;
    title: string;
    description: string;
    user_id: number;
    video_link: string;
    download_link: string | null;
  }>;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export async function fetchShortVideos(
  token: string,
  page: number = 1,
  size: number = 10
): Promise<Video[]> {
  if (!token?.trim()) {
    throw new ValidationError("Authentication token is required");
  }

  try {
    const { data } = await axios.get<ShortVideoResponse>(
      `https://api.unitribe.app/ut/api/videos/short`,
      {
        params: {
          page,
          size,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    if (!data || !data.data || !Array.isArray(data.data)) {
      throw new ValidationError("Invalid response structure from videos/short API");
    }

    // Helper function to generate random view count
    const getRandomViewCount = (): string => {
      const views = Math.floor(Math.random() * 10000000) + 100; // Random between 100 and 10,000,100
      return views.toString();
    };

    // Helper function to generate random date (within last 2 years)
    const getRandomDate = (): string => {
      const now = new Date();
      const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
      const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
      return new Date(randomTime).toISOString();
    };

    // Transform API response to Video format and filter out null videos and videos with missing critical data
    return data.data
      .filter(
        (video) =>
          video !== null &&
          video !== undefined &&
          video.id &&
          video.title &&
          video.download_link !== null && // Filter out videos with null download_link
          video.download_link !== undefined &&
          (video.poster || video.title) // At least have a title to create placeholder
      )
      .map((video) => {
        // Use poster image for thumbnail, fallback to vertical placeholder for shorts (180x320 aspect ratio)
        const thumbnail = video.poster || 
          `https://via.placeholder.com/180x320/6366f1/ffffff?text=${encodeURIComponent((video.title || "Short").substring(0, 20))}`;

        return {
          id: video.id.toString(),
          title: video.title || "Untitled Short",
          description: video.description || "",
          thumbnail,
          viewCount: getRandomViewCount(),
          channel: {
            channelId: video.user_id.toString(),
            channelTitle: "User Channel", // API doesn't provide channel name
            channelImage: `https://via.placeholder.com/40x40/6366f1/ffffff?text=U${video.user_id}`, // Placeholder
          },
          publishedDate: getRandomDate(),
          download_link: video.download_link || null,
        } as Video;
      })
      .filter(
        (video) =>
          video !== null &&
          video !== undefined &&
          video.id &&
          video.title &&
          video.thumbnail &&
          video.download_link !== null && // Filter out videos with null download_link
          video.download_link !== undefined
      );
  } catch (error) {
    handleAPIError(error, "fetchShortVideos");
  }
}

export interface CategoryVideosResponse {
  data: Array<{
    id: number;
    video_type: string;
    category_id: number;
    poster: string | null;
    title: string;
    description: string;
    user_id: number;
    video_link: string;
    download_link: string | null;
    category: {
      id: number;
      title: string;
      description?: string;
      slug?: string;
    };
  }>;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export async function fetchVideosByCategoryId(
  categoryId: number,
  token: string,
  page: number = 1,
  size: number = 10
): Promise<Video[]> {
  if (!token?.trim()) {
    throw new ValidationError("Authentication token is required");
  }

  if (!categoryId || categoryId <= 0) {
    throw new ValidationError("Valid category ID is required");
  }

  try {
    const { data } = await axios.get<CategoryVideosResponse>(
      `https://api.unitribe.app/ut/api/categories/${categoryId}/videos`,
      {
        params: {
          page,
          size,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    if (!data || !data.data || !Array.isArray(data.data)) {
      throw new ValidationError("Invalid response structure from categories/{id}/videos API");
    }

    // Helper function to generate random view count
    const getRandomViewCount = (): string => {
      const views = Math.floor(Math.random() * 10000000) + 100; // Random between 100 and 10,000,100
      return views.toString();
    };

    // Helper function to generate random date (within last 2 years)
    const getRandomDate = (): string => {
      const now = new Date();
      const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
      const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
      return new Date(randomTime).toISOString();
    };

    // Transform API response to Video format and filter out null videos
    return data.data
      .filter((video) => video !== null && video !== undefined)
      .map((video) => {
        // Use poster image for thumbnail, fallback to placeholder if not available
        // Use vertical placeholder for shorts, horizontal for long videos
        const isShort = video.video_type === "short";
        const placeholderDimensions = isShort ? "180x320" : "320x180";
        const thumbnail = video.poster || 
          `https://via.placeholder.com/${placeholderDimensions}/6366f1/ffffff?text=${encodeURIComponent((video.title || (isShort ? "Short" : "Video")).substring(0, 20))}`;

        return {
          id: video.id.toString(),
          title: video.title || "Untitled Video",
          description: video.description || "",
          thumbnail,
          viewCount: getRandomViewCount(),
          channel: {
            channelId: video.user_id.toString(),
            channelTitle: "User Channel", // API doesn't provide channel name
            channelImage: `https://via.placeholder.com/40x40/6366f1/ffffff?text=U${video.user_id}`, // Placeholder
          },
          publishedDate: getRandomDate(),
          download_link: video.download_link || null,
        } as Video;
      });
  } catch (error) {
    handleAPIError(error, "fetchVideosByCategoryId");
  }
}

export interface UploadVideoData {
  title: string;
  description: string;
  video_type: string;
  category_id: string;
  file: File;
}

export async function uploadVideo(
  data: UploadVideoData,
  token: string,
  onProgress?: (progress: number) => void
): Promise<any> {
  if (!data.title?.trim()) {
    throw new ValidationError("Title cannot be empty");
  }

  if (!data.description?.trim()) {
    throw new ValidationError("Description cannot be empty");
  }

  if (!data.video_type?.trim()) {
    throw new ValidationError("Video type cannot be empty");
  }

  if (!data.category_id?.trim()) {
    throw new ValidationError("Category ID cannot be empty");
  }

  if (!data.file) {
    throw new ValidationError("Video file is required");
  }

  if (!token?.trim()) {
    throw new ValidationError("Authentication token is required");
  }

  try {
    const formData = new FormData();
    formData.append("file", data.file);

    // Build query parameters for other fields
    const queryParams = new URLSearchParams({
      title: data.title,
      description: data.description,
      video_type: data.video_type,
      category_id: data.category_id,
    });

    const res = await axios.post(
      `https://api.unitribe.app/ut/api/videos?${queryParams.toString()}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // Axios will set multipart boundary automatically
        },
        timeout: 300000, // 5 minutes timeout for large file uploads
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    return { data: res.data, status: res.status };
  } catch (error) {
    handleAPIError(error, "uploadVideo");
  }
}