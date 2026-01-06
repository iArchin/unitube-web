import axios from "axios";

import { Video } from "../../types/custom_types";

// Custom error classes for better error handling
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiError?: any
  ) {
    super(message);
    this.name = "APIError";
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
      throw new APIError(
        `API quota exceeded or access forbidden for ${context}`,
        statusCode,
        apiError
      );
    }

    if (statusCode === 400) {
      throw new APIError(
        `Invalid request parameters for ${context}: ${
          apiError?.message || error.message
        }`,
        statusCode,
        apiError
      );
    }

    if (statusCode === 404) {
      throw new APIError(
        `Resource not found for ${context}`,
        statusCode,
        apiError
      );
    }

    if (statusCode && statusCode >= 500) {
      throw new APIError(
        `API server error for ${context}`,
        statusCode,
        apiError
      );
    }

    throw new APIError(
      `API error in ${context}: ${error.message}`,
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

  throw new APIError(
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
    throw new APIError(
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

export async function fetchSearchQuery(
  searchQuery: string,
  page: number = 1,
  size: number = 10,
  token: string = ""
): Promise<SearchVideosResult> {
  if (!searchQuery?.trim()) {
    throw new ValidationError("Search query cannot be empty");
  }

  try {
    const headers: Record<string, string> = {};
    // Token is optional for this endpoint, but we pass it if available
    if (token?.trim()) {
      headers.Authorization = `Bearer ${token}`;
    }

    const { data } = await axios.get<SearchVideosResponse>(
      "https://api.unitribe.app/ut/api/videos/search",
      {
        params: {
          query: searchQuery,
          page,
          size,
        },
        headers,
        timeout: 10000,
      }
    );

    if (!data || !Array.isArray(data.data)) {
      throw new ValidationError(
        "Invalid response structure from videos/search API"
      );
    }

    // Helper function to generate random view count
    const getRandomViewCount = (): string => {
      const views = Math.floor(Math.random() * 10000000) + 100; // Random between 100 and 10,000,100
      return views.toString();
    };

    // Helper function to generate random date (within last 2 years)
    const getRandomDate = (): string => {
      const now = new Date();
      const twoYearsAgo = new Date(
        now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000
      );
      const randomTime =
        twoYearsAgo.getTime() +
        Math.random() * (now.getTime() - twoYearsAgo.getTime());
      return new Date(randomTime).toISOString();
    };

    const videos = data.data
      // Filter out entries without critical data (but allow null download_link)
      .filter(
        (video) =>
          video !== null && video !== undefined && video.id && video.title
      )
      .map((video) => {
        const thumbnail =
          video.poster ||
          `https://via.placeholder.com/320x180/6366f1/ffffff?text=${encodeURIComponent(
            (video.title || "Video").substring(0, 30)
          )}`;

        return {
          id: video.id.toString(),
          title: video.title || "Untitled Video",
          description: video.description || "",
          thumbnail,
          viewCount: getRandomViewCount(),
          channel: {
            channelId: video.user_id.toString(),
            channelTitle: "User Channel", // API doesn't provide channel name
            channelImage: `https://via.placeholder.com/40x40/6366f1/ffffff?text=U${video.user_id}`,
          },
          user: {
            name: video.user.name,
            email: video.user.email,
          },
          created_at: getRandomDate(),
          download_link: video.download_link,
        } as Video;
      });

    const hasMore =
      data.next_page_url !== null || (data.to || 0) < (data.total || 0);

    return {
      videos,
      pagination: {
        page: data.current_page || page,
        perPage: (data.per_page as number) || size,
        total: data.total || videos.length,
        hasMore,
      },
    } as SearchVideosResult;
  } catch (error) {
    handleAPIError(error, "fetchSearchQuery");
  }
}

export interface SearchVideosResponse {
  current_page: number;
  data: Array<{
    user: any;
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
  from: number | null;
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
  to: number | null;
  total: number;
}

export interface SearchVideosResult {
  videos: Video[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    hasMore: boolean;
  };
}

export interface Category {
  id: string;
  name: string;
  [key: string]: any;
}

export async function fetchAllCategories(token: string): Promise<Category[]> {
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
    category_id: number;
    user_id: number;
    created_at: string;
    poster: string | null;
    likes_count: number;
    dislikes_count: number;
    comments_count: number;
    views_count: number;
    category: {
      id: number;
      title: string;
      description: string;
      slug: string;
    };
    user: {
      id: number;
      name: string;
      email: string;
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
// API response type for get-video endpoint
export interface GetVideoResponse {
  id: number;
  request_id: string;
  title: string;
  description: string;
  video_type: string;
  poster: string | null;
  download_link: string | null;
  status: string;
  category: {
    id: number;
    title: string;
    slug: string;
  };
  uploader: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  views_count: number;
}

/**
 * Fetches a single video by ID from the unitribe API
 * @param videoId - Video ID (required)
 * @param token - Authentication token (optional, not required for this endpoint)
 * @returns Video data
 */
export async function fetchVideoById(
  videoId: string,
  token?: string
): Promise<Video> {
  if (!videoId?.trim()) {
    throw new ValidationError("Video ID cannot be empty");
  }

  try {
    const headers: Record<string, string> = {};
    // Token is optional for this endpoint
    if (token?.trim()) {
      headers.Authorization = `Bearer ${token}`;
    }

    const { data } = await axios.get<GetVideoResponse>(
      `https://api.unitribe.app/ut/api/videos/get-video`,
      {
        params: {
          id: videoId,
        },
        headers,
        timeout: 10000,
      }
    );

    if (!data) {
      throw new ValidationError("Video not found");
    }

    // Helper function to generate random view count
    const getRandomViewCount = (): string => {
      const views = Math.floor(Math.random() * 10000000) + 100;
      return views.toString();
    };

    // Use poster image for thumbnail, fallback to placeholder if not available
    const thumbnail =
      data.poster ||
      `https://via.placeholder.com/320x180/6366f1/ffffff?text=${encodeURIComponent(
        (data.title || "Video").substring(0, 30)
      )}`;

    return {
      id: data.id.toString(),
      title: data.title || "Untitled Video",
      description: data.description || "",
      thumbnail,
      viewCount: getRandomViewCount(),
      channel: {
        channelId: data.uploader.id.toString(),
        channelTitle: data.uploader.name || "User Channel",
        channelImage: `https://via.placeholder.com/40x40/6366f1/ffffff?text=${data.uploader.name
          .substring(0, 2)
          .toUpperCase()}`,
      },
      user: {
        name: data.uploader.name,
        email: data.uploader.email,
      },
      created_at: data.created_at,
      download_link: data.download_link || null,
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
  try {
    const headers: Record<string, string> = {};
    // Only add Authorization header if token is provided
    if (token?.trim()) {
      headers.Authorization = `Bearer ${token}`;
    }

    const { data } = await axios.get<CategoriesVideosResponse>(
      `https://api.unitribe.app/ut/api/categories/videos`,
      {
        params: {
          page,
          size,
        },
        headers,
        timeout: 10000,
      }
    );

    if (!data || !data.data || !Array.isArray(data.data)) {
      throw new ValidationError(
        "Invalid response structure from categories/videos API"
      );
    }

    // Transform API response to CategoryWithVideos format
    return data.data.map((category) => ({
      id: category.id,
      title: category.title,
      description: category.description,
      slug: category.slug,
      videos: category.videos
        // Filter out videos with null poster (no thumbnail available)
        .filter((video) => video.poster !== null)
        .map((video) => {
          // Use poster image for thumbnail, fallback to placeholder if not available
          const thumbnail =
            video.poster ||
            `https://via.placeholder.com/320x180/6366f1/ffffff?text=${encodeURIComponent(
              (video.title || "Video").substring(0, 30)
            )}`;

          // Generate channel image from user name initials
          const userInitials =
            video.user?.name?.substring(0, 2).toUpperCase() || "U";

          return {
            id: video.id.toString(),
            title: video.title || "Untitled Video",
            description: video.description || "",
            thumbnail,
            viewCount: video.views_count?.toString() || "0",
            channel: {
              channelId: video.user_id.toString(),
              channelTitle: video.user?.name || "User Channel",
              channelImage: `https://via.placeholder.com/40x40/6366f1/ffffff?text=${userInitials}`,
            },
            created_at: video.created_at, // API doesn't provide published date, using random date
            download_link: null, // This endpoint doesn't provide download_link
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
    user: {
      id: number;
      name: string;
      email: string;
    };
    id: number;
    video_type: string;
    category_id: number;
    poster: string | null;
    title: string;
    description: string;
    user_id: number;
    video_link: string;
    download_link: string | null;
    status: string;
    created_at: string;
    likes_count: number;
    dislikes_count: number;
    comments_count: number;
    views_count: number;
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
  page: number = 1,
  size: number = 10
): Promise<Video[]> {
  try {
    const headers: Record<string, string> = {};
    // Only add Authorization header if token is provided

    const { data } = await axios.get<ShortVideoResponse>(
      `https://api.unitribe.app/ut/api/videos/short`,
      {
        params: {
          page,
          size,
        },
        timeout: 10000,
      }
    );

    if (!data || !data.data || !Array.isArray(data.data)) {
      throw new ValidationError(
        "Invalid response structure from videos/short API"
      );
    }

    // Transform API response to Video format and filter out null videos and videos with missing critical data
    return data.data.map((video) => {
      // Use poster image for thumbnail, fallback to vertical placeholder for shorts (180x320 aspect ratio)
      const thumbnail =
        video.poster ||
        `https://via.placeholder.com/180x320/6366f1/ffffff?text=${encodeURIComponent(
          (video.title || "Short").substring(0, 20)
        )}`;

      return {
        id: video.id.toString(),
        title: video.title || "Untitled Short",
        description: video.description || "",
        thumbnail,
        viewCount: (video.views_count || 0).toString(),
        channel: {
          channelId: video.user_id.toString(),
          channelTitle: video.user?.name || "User Channel",
          channelImage: `https://via.placeholder.com/40x40/6366f1/ffffff?text=${encodeURIComponent(
            (video.user?.name || "U").substring(0, 2).toUpperCase()
          )}`,
        },
        created_at: video.created_at || new Date().toISOString(),
        download_link: video.download_link || null,
        user: video.user,
      } as Video;
    });
  } catch (error) {
    handleAPIError(error, "fetchShortVideos");
  }
}

export interface CategoryVideosResponse {
  data: Array<{
    views_count: number;
    created_at: string;
    user: any;
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
      throw new ValidationError(
        "Invalid response structure from categories/{id}/videos API"
      );
    }

    // Transform API response to Video format and filter out null videos
    return data.data
      .filter((video) => video !== null && video !== undefined)
      .map((video) => {
        // Use poster image for thumbnail, fallback to placeholder if not available
        // Use vertical placeholder for shorts, horizontal for long videos
        const isShort = video.video_type === "short";
        const placeholderDimensions = isShort ? "180x320" : "320x180";
        const thumbnail =
          video.poster ||
          `https://via.placeholder.com/${placeholderDimensions}/6366f1/ffffff?text=${encodeURIComponent(
            (video.title || (isShort ? "Short" : "Video")).substring(0, 20)
          )}`;

        return {
          id: video.id.toString(),
          title: video.title || "Untitled Video",
          description: video.description || "",
          thumbnail,
          viewCount: video.views_count?.toString() || "0",
          channel: {
            channelId: video.user_id.toString(),
            channelTitle: video.user.name || "User Channel", // API doesn't provide channel name
            channelImage: `https://via.placeholder.com/40x40/6366f1/ffffff?text=U${video.user_id}`, // Placeholder
          },
          created_at: video.created_at,
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
  poster?: File | "";
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
    // Append poster file if provided, otherwise append empty string
    if (data.poster && data.poster instanceof File) {
      formData.append("poster", data.poster);
    } else {
      formData.append("poster", "");
    }
    // Build query parameters for other fields
    const queryParams = new URLSearchParams({
      title: data.title,
      description: data.description,
      video_type: data.video_type,
      category_id: data.category_id,
    });

    const res = await axios.post(
      `https://api.unitribe.app/ut/api/videos/upload?${queryParams.toString()}`,
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

// API response type for user videos
export interface UserVideosResponse {
  data: Array<{
    id: number;
    video_type: string;
    category_id: number;
    poster: string | null;
    title: string;
    description: string;
    user_id: number;
    video_link: string;
    created_at: string;
    category: {
      id: number;
      title: string;
      slug: string;
    };
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * Fetches videos uploaded by a specific user
 * @param userId - User ID (required)
 * @param page - Page number (default: 1)
 * @param size - Number of videos per page (default: 10)
 * @param token - Authentication token (optional)
 * @returns Array of videos uploaded by the user
 */
export async function fetchUserVideos(
  userId: string | number,
  page: number = 1,
  size: number = 10,
  token?: string
): Promise<{
  videos: Video[];
  pagination: { page: number; total: number; hasMore: boolean };
}> {
  if (!userId) {
    throw new ValidationError("User ID cannot be empty");
  }

  try {
    const headers: Record<string, string> = {};
    // Token is optional for this endpoint
    if (token?.trim()) {
      headers.Authorization = `Bearer ${token}`;
    }

    const { data } = await axios.get<UserVideosResponse>(
      `https://api.unitribe.app/ut/api/videos/get-video/public/user`,
      {
        params: {
          user_id: userId,
          page,
          size,
        },
        headers,
        timeout: 10000,
      }
    );

    if (!data || !data.data || !Array.isArray(data.data)) {
      throw new ValidationError(
        "Invalid response structure from videos/get-video/public/user API"
      );
    }

    // Helper function to generate random view count
    const getRandomViewCount = (): string => {
      const views = Math.floor(Math.random() * 10000000) + 100;
      return views.toString();
    };

    // Transform API response to Video format
    const videos = data.data
      .filter(
        (video) =>
          video !== null &&
          video !== undefined &&
          video.user !== null &&
          video.user !== undefined
      )
      .map((video) => {
        // Use poster image for thumbnail, fallback to placeholder
        const isShort = video.video_type === "short";
        const placeholderDimensions = isShort ? "180x320" : "320x180";
        const thumbnail =
          video.poster ||
          `https://via.placeholder.com/${placeholderDimensions}/6366f1/ffffff?text=${encodeURIComponent(
            (video.title || (isShort ? "Short" : "Video")).substring(0, 20)
          )}`;

        // Safely extract user info with fallbacks
        const user = video.user || {};
        const userName = user.name || "Unknown User";
        const userId = user.id?.toString() || "0";
        const userEmail = user.email || "";

        return {
          id: video.id.toString(),
          title: video.title || "Untitled Video",
          description: video.description || "",
          thumbnail,
          viewCount: getRandomViewCount(),
          channel: {
            channelId: userId,
            channelTitle: userName,
            channelImage: `https://via.placeholder.com/40x40/6366f1/ffffff?text=${userName
              .substring(0, 2)
              .toUpperCase()}`,
          },
          user: {
            name: userName,
            email: userEmail,
          },
          created_at: video.created_at,
          download_link: video.video_link || null,
          video_type: video.video_type || "long",
        } as Video;
      });

    const meta = data.meta || {
      current_page: page,
      last_page: 1,
      per_page: size,
      total: videos.length,
    };
    const hasMore = meta.current_page < meta.last_page;

    return {
      videos,
      pagination: {
        page: meta.current_page || page,
        total: meta.total || videos.length,
        hasMore,
      },
    };
  } catch (error) {
    handleAPIError(error, "fetchUserVideos");
  }
}

/**
 * Likes a video
 * @param videoId - Video ID (required)
 * @param token - Authentication token (required)
 * @returns API response
 */
export async function likeVideo(
  videoId: string | number,
  token: string
): Promise<any> {
  if (!videoId) {
    throw new ValidationError("Video ID cannot be empty");
  }

  if (!token?.trim()) {
    throw new ValidationError("Authentication token is required");
  }

  try {
    const { data } = await axios.post(
      `https://api.unitribe.app/ut/api/videos/${videoId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    return data;
  } catch (error) {
    handleAPIError(error, "likeVideo");
  }
}

/**
 * Dislikes a video
 * @param videoId - Video ID (required)
 * @param token - Authentication token (required)
 * @returns API response
 */
export async function dislikeVideo(
  videoId: string | number,
  token: string
): Promise<any> {
  if (!videoId) {
    throw new ValidationError("Video ID cannot be empty");
  }

  if (!token?.trim()) {
    throw new ValidationError("Authentication token is required");
  }

  try {
    const { data } = await axios.post(
      `https://api.unitribe.app/ut/api/videos/${videoId}/dislike`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    return data;
  } catch (error) {
    handleAPIError(error, "dislikeVideo");
  }
}

/**
 * Registers a view for a video
 * Called when user watches at least 10% of the video duration while tab is visible
 * @param videoId - Video ID (required)
 * @returns API response
 */
export async function registerVideoView(
  videoId: string | number
): Promise<any> {
  if (!videoId) {
    throw new ValidationError("Video ID cannot be empty");
  }

  try {
    const { data } = await axios.post(
      `https://api.unitribe.app/ut/api/videos/${videoId}/view`,
      {},
      {
        timeout: 10000,
      }
    );

    return data;
  } catch (error) {
    handleAPIError(error, "registerVideoView");
  }
}

// Comment API response types
export interface Comment {
  id: number;
  user_id: number;
  video_id: number;
  body: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CommentsResponse {
  status: boolean;
  comments: {
    current_page: number;
    data: Comment[];
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
  };
}

/**
 * Fetches comments for a video or short
 * @param videoId - Video ID (required)
 * @param token - Authentication token (required)
 * @param page - Page number (default: 1)
 * @param size - Number of comments per page (default: 50)
 * @returns Comments response with pagination
 */
export async function fetchVideoComments(
  videoId: string | number,
  token: string,
  page: number = 1,
  size: number = 50
): Promise<CommentsResponse> {
  if (!videoId) {
    throw new ValidationError("Video ID cannot be empty");
  }

  if (!token?.trim()) {
    throw new ValidationError("Authentication token is required");
  }

  try {
    const { data } = await axios.get<CommentsResponse>(
      `https://api.unitribe.app/ut/api/videos/${videoId}/comments`,
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

    if (!data || !data.status || !data.comments) {
      throw new ValidationError("Invalid response structure from comments API");
    }

    return data;
  } catch (error) {
    handleAPIError(error, "fetchVideoComments");
  }
}

/**
 * Creates a new comment on a video or short
 * @param videoId - Video ID (required)
 * @param body - Comment text (required)
 * @param token - Authentication token (required)
 * @returns Created comment data
 */
export async function createComment(
  videoId: string | number,
  body: string,
  token: string
): Promise<Comment> {
  if (!videoId) {
    throw new ValidationError("Video ID cannot be empty");
  }

  if (!body?.trim()) {
    throw new ValidationError("Comment body cannot be empty");
  }

  if (!token?.trim()) {
    throw new ValidationError("Authentication token is required");
  }

  try {
    const { data } = await axios.post<Comment>(
      `https://api.unitribe.app/ut/api/comments/new`,
      {
        video_id: videoId,
        body: body.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    return data;
  } catch (error) {
    handleAPIError(error, "createComment");
  }
}
