/**
 * Comprehensive YouTube URL & Video ID Parser and Helper
 * Prevents truncated links, handles all URL formats (standard, shorts, embed, timestamped, mobile)
 */

export interface YouTubeInfo {
  videoId: string | null;
  timestamp?: number;
  cleanUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
}

/**
 * Extracts a clean 11-character YouTube video ID from any format:
 * - https://www.youtube.com/watch?v=kJvWq6q3sEQ
 * - https://youtu.be/kJvWq6q3sEQ?t=120
 * - https://www.youtube.com/embed/kJvWq6q3sEQ
 * - https://www.youtube.com/shorts/kJvWq6q3sEQ
 * - https://m.youtube.com/watch?v=kJvWq6q3sEQ
 * - kJvWq6q3sEQ (direct ID)
 */
export function extractYouTubeVideoId(input: string | undefined | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already an 11-character alphanumeric/dash/underscore ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex capturing standard watch, youtu.be, embed, shorts, live
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regex);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Extracts start timestamp in seconds from url (e.g. ?t=120 or &t=2m15s)
 */
export function extractYouTubeTimestamp(url: string): number {
  if (!url) return 0;
  const tMatch = url.match(/[?&]t=([0-9hms]+)/);
  if (!tMatch) return 0;

  const tStr = tMatch[1];
  if (/^\d+$/.test(tStr)) {
    return parseInt(tStr, 10);
  }

  // Parse formats like 1h2m30s or 2m10s
  let seconds = 0;
  const hours = tStr.match(/(\d+)h/);
  const minutes = tStr.match(/(\d+)m/);
  const secs = tStr.match(/(\d+)s/);

  if (hours) seconds += parseInt(hours[1], 10) * 3600;
  if (minutes) seconds += parseInt(minutes[1], 10) * 60;
  if (secs) seconds += parseInt(secs[1], 10);

  return seconds;
}

/**
 * Generates a clean, uncut canonical YouTube watch link
 */
export function getYouTubeWatchUrl(videoId: string, seconds: number = 0): string {
  const cleanId = extractYouTubeVideoId(videoId) || videoId;
  if (!cleanId) return '';
  if (seconds > 0) {
    return `https://www.youtube.com/watch?v=${cleanId}&t=${Math.floor(seconds)}s`;
  }
  return `https://www.youtube.com/watch?v=${cleanId}`;
}

/**
 * Generates a clean embed URL with privacy enhancements (youtube-nocookie)
 * and without restrictive origins that trigger 403 / embed blocks
 */
export function getYouTubeEmbedUrl(videoId: string, startTime: number = 0): string {
  const cleanId = extractYouTubeVideoId(videoId) || 'kJvWq6q3sEQ';
  const startParam = startTime > 0 ? `&start=${Math.floor(startTime)}` : '';
  return `https://www.youtube-nocookie.com/embed/${cleanId}?enablejsapi=1&rel=0&playsinline=1&modestbranding=1${startParam}`;
}

/**
 * Generates a high quality thumbnail image URL
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'hqdefault' | 'maxresdefault' | 'mqdefault' = 'hqdefault'): string {
  const cleanId = extractYouTubeVideoId(videoId) || 'kJvWq6q3sEQ';
  return `https://img.youtube.com/vi/${cleanId}/${quality}.jpg`;
}

/**
 * Generates a clean search query URL without problematic symbols
 */
export function getCleanYouTubeSearchUrl(songOrTopic: string, channel: string): string {
  const cleanTopic = songOrTopic
    .replace(/[()\/\\+*?^$\[\]{}|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const query = `${cleanTopic} ${channel} guitarra leccion tutorial`.trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
