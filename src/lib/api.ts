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
