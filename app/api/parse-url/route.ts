import { NextResponse } from 'next/server';
import axios from 'axios';

// New helper function to extract artist and title from YouTube video title
function extractArtistAndTitle(videoTitle: string): { artist: string; title: string } {
  // Remove common suffixes like "(Official Audio)", "(Official Video)", etc.
  const cleanTitle = videoTitle.replace(/\s*[\(\]].*?[\)\]].*$/, '').trim();

  // Check if the title contains a hyphen (assuming "Artist - Title" format)
  const parts = cleanTitle.split('-').map((part) => part.trim());

  if (parts.length >= 2) {
    return {
      artist: parts[0],
      title: parts.slice(1).join(' - '), // Join the rest in case there are multiple hyphens
    };
  } else {
    // If no hyphen, return the whole string as title and leave artist empty
    return {
      artist: '',
      title: cleanTitle,
    };
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    let title, artist, source;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      source = 'YouTube';
      // Extract video ID from YouTube URL
      const videoId = url.includes('youtu.be')
        ? url.split('/').pop()?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];

      if (!videoId) {
        return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
      }

      // Fetch video details from YouTube API
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
      );

      const videoDetails = response.data.items[0].snippet;
      const extractedInfo = extractArtistAndTitle(videoDetails.title);

      title = extractedInfo.title;
      artist = extractedInfo.artist || videoDetails.channelTitle;

      // Clean up artist name by removing ' - Topic' if present
      artist = artist.replace(/ - Topic$/, '');
    } else {
      return NextResponse.json({ error: 'Unsupported URL' }, { status: 400 });
    }

    return NextResponse.json({ title, artist, source });
  } catch (error) {
    console.error('Error parsing URL:', error);
    return NextResponse.json({ error: 'Failed to parse URL' }, { status: 500 });
  }
}
