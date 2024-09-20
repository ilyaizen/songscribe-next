import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Genius API base URL
const GENIUS_API_BASE_URL = 'https://api.genius.com';

// Helper function to clean up the title
function cleanupTitle(title: string): string {
  // Remove brackets and their contents at the end of the string
  return title.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

// Function to search for a song using the Genius API
async function searchSong(title: string, artist: string) {
  try {
    const cleanTitle = cleanupTitle(title);
    const cleanArtist = cleanupTitle(artist);
    const query = `${cleanArtist} ${cleanTitle}`;

    const response = await axios.get(`${GENIUS_API_BASE_URL}/search`, {
      headers: {
        Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
      },
      params: { q: query },
    });

    const hits: GeniusHit[] = response.data.response.hits;
    if (hits.length === 0) {
      return null;
    }

    // Find the best match
    const bestMatch =
      hits.find(
        (hit: GeniusHit) =>
          hit.result.primary_artist.name.toLowerCase().includes(cleanArtist.toLowerCase()) &&
          hit.result.title.toLowerCase().includes(cleanTitle.toLowerCase())
      ) || hits[0];

    return bestMatch.result;
  } catch (error) {
    console.error('Error searching for song:', error);
    throw new Error('Failed to search for song');
  }
}

// Function to fetch and extract lyrics from a Genius song page
async function fetchLyrics(url: string) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  // Extract lyrics from the page using multiple potential selectors
  let lyrics = '';
  const selectors = [
    'div[class^="Lyrics__Container"]',
    '.lyrics',
    '.song_body-lyrics',
    '[data-lyrics-container="true"]',
  ];

  selectors.forEach((selector) => {
    $(selector).each((_, elem) => {
      lyrics += $(elem).html() + '\n';
    });
  });

  // Clean up the extracted lyrics
  if (lyrics) {
    lyrics = lyrics
      .replace(/<br>/g, '\n') // Replace <br> tags with newlines
      .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '') // Remove all HTML tags except <br>
      .split('\n')
      .filter((line) => !line.trim().match(/^\[.*\]$/)) // Remove lines that are just [verse] or [chorus] labels
      .map((line) => line.trim())
      .join('\n');
  }

  return lyrics;
}

// API route handler for POST requests
export async function POST(request: Request) {
  try {
    const { title, artist } = await request.json();

    // Search for the song using the Genius API
    const song = await searchSong(title, artist);
    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Fetch and extract lyrics from the Genius song page
    const lyrics = await fetchLyrics(song.url);
    if (!lyrics) {
      return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 });
    }

    // Extract additional song information
    const songInfo = {
      title: song.title,
      cleanTitle: cleanupTitle(song.title),
      artist: song.primary_artist.name, // Ensure this is included
      releaseDate: song.release_date_for_display || 'N/A',
      imageUrl: song.song_art_image_url,
    };

    return NextResponse.json({ lyrics, songInfo });
  } catch (error) {
    console.error('Error fetching lyrics:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch lyrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

interface GeniusHit {
  result: {
    primary_artist: {
      name: string;
    };
    title: string;
    url: string;
    release_date_for_display?: string;
    song_art_image_url?: string;
  };
}
