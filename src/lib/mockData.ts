import { Video } from "../../types/custom_types";

// Generate placeholder video data
export function generateMockVideos(count: number, category: string): Video[] {
  const videos: Video[] = [];
  const categories = {
    trending: {
      titles: [
        "Amazing Tech Review 2024",
        "Top 10 Tips for Success",
        "Unboxing the Latest Gadget",
        "React Tutorial for Beginners",
        "Mountain Adventure Vlog",
        "Cooking Amazing Dishes",
        "JavaScript Masterclass",
        "Photography Tips & Tricks",
      ],
      channels: [
        "TechReview Channel",
        "Success Tips Daily",
        "Gadget Unboxer",
        "Code Academy",
        "Adventure Vlogger",
        "Chef's Kitchen",
        "JS Master",
        "Photo Pro",
      ],
    },
    sports: {
      titles: [
        "Championship Highlights 2024",
        "Top 10 Soccer Goals",
        "Basketball Game Analysis",
        "Tennis Match Recap",
        "Football Training Tips",
        "Olympic Moments",
        "Athlete Interview",
        "Sports News Update",
      ],
      channels: [
        "Sports Central",
        "Soccer Highlights",
        "Basketball Pro",
        "Tennis World",
        "Football Training",
        "Olympic Channel",
        "Athlete Talk",
        "Sports News",
      ],
    },
    music: {
      titles: [
        "New Album Release 2024",
        "Concert Live Performance",
        "Music Production Tutorial",
        "Best Hits Mix",
        "Acoustic Session",
        "DJ Set Live",
        "Behind the Scenes",
        "Music Review",
      ],
      channels: [
        "Music Hub",
        "Live Concerts",
        "Producer Studio",
        "Hit Mixes",
        "Acoustic Sessions",
        "DJ Mix",
        "Music Behind",
        "Review Channel",
      ],
    },
    gaming: {
      titles: [
        "Epic Gameplay Moments",
        "New Game Review",
        "Speedrun World Record",
        "Gaming Setup Tour",
        "Multiplayer Highlights",
        "Game Tutorial Guide",
        "Esports Tournament",
        "Gaming News",
      ],
      channels: [
        "Gameplay Pro",
        "Game Reviews",
        "Speedrun Master",
        "Setup Showcase",
        "Multiplayer Hub",
        "Tutorial Guides",
        "Esports Central",
        "Gaming News",
      ],
    },
    news: {
      titles: [
        "Breaking News Update",
        "Technology News Today",
        "World Events Coverage",
        "Business News Analysis",
        "Health & Science Update",
        "Weather Forecast",
        "Political Discussion",
        "Current Affairs",
      ],
      channels: [
        "News Channel",
        "Tech News",
        "World News",
        "Business Today",
        "Science Daily",
        "Weather Center",
        "Politics Now",
        "Current Affairs",
      ],
    },
    shorts: {
      titles: [
        "Quick Cooking Tip",
        "Funny Moment",
        "Dance Challenge",
        "Life Hack",
        "Pet Compilation",
        "Travel Short",
        "Comedy Skit",
        "Quick Tutorial",
      ],
      channels: [
        "Quick Tips",
        "Funny Moments",
        "Dance Crew",
        "Life Hacks",
        "Pet Lovers",
        "Travel Shorts",
        "Comedy Central",
        "Quick Learn",
      ],
    },
  };

  const categoryData =
    categories[category as keyof typeof categories] || categories.trending;

  for (let i = 0; i < count; i++) {
    const titleIndex = i % categoryData.titles.length;
    const videoNumber = Math.floor(i / categoryData.titles.length) + 1;
    const title =
      videoNumber > 1
        ? `${categoryData.titles[titleIndex]} ${videoNumber}`
        : categoryData.titles[titleIndex];

    // Use vertical aspect ratio for shorts (9:16), horizontal for others (16:9)
    const thumbnailWidth = category === "shorts" ? 180 : 320;
    const thumbnailHeight = category === "shorts" ? 320 : 180;

    videos.push({
      id: `${category}-video-${i + 1}`,
      title: title,
      description: `This is a placeholder video description for ${title}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      thumbnail: `https://picsum.photos/seed/${category}-${i}/${thumbnailWidth}/${thumbnailHeight}`,
      viewCount: Math.floor(Math.random() * 10000000).toString(),
      channel: {
        channelId: `${category}-channel-${i + 1}`,
        channelTitle: categoryData.channels[titleIndex],
        channelImage: `https://picsum.photos/seed/${category}-channel-${i}/40/40`,
      },
      created_at: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });
  }

  return videos;
}
