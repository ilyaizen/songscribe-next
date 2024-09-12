import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Genius API base URL
const GENIUS_API_BASE_URL = 'https://api.genius.com';

// Function to search for a song
async function searchSong(title: string, artist: string) {
  console.log(`Searching for song: "${title}" by ${artist}`);
  try {
    const response = await axios.get(`${GENIUS_API_BASE_URL}/search`, {
      headers: {
        Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
      },
      params: {
        q: `${title} ${artist}`,
      },
    });

    console.log('Search response:', response.data);
    const result = response.data.response.hits[0]?.result;
    if (!result) {
      console.log('No results found for the given song and artist');
      return null;
    }
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error searching for song:', error.message);
    } else {
      console.error('Unknown error occurred while searching for song');
    }
    throw new Error('Failed to search for song');
  }
}

// Function to fetch lyrics from Genius
async function fetchLyrics(url: string) {
  console.log(`Fetching lyrics from URL: ${url}`);
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

  // Clean up the lyrics
  if (lyrics) {
    lyrics = lyrics
      .replace(/<br>/g, '\n')
      .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '')
      .split('\n')
      .filter((line) => !line.trim().match(/^\[.*\]$/))
      .map((line) => line.trim())
      .join('\n');
  }

  console.log('Extracted and cleaned lyrics length:', lyrics?.length);
  return lyrics;
}

export async function POST(request: Request) {
  try {
    const { title, artist } = await request.json();
    console.log(`Received request for lyrics: "${title}" by ${artist}`);

    // Search for the song
    const song = await searchSong(title, artist);
    if (!song) {
      console.log('Song not found');
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Fetch lyrics
    const lyrics = await fetchLyrics(song.url);
    if (!lyrics) {
      console.log('Lyrics not found');
      return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 });
    }

    console.log('Successfully fetched lyrics');
    return NextResponse.json({ lyrics });
  } catch (error) {
    console.error('Error fetching lyrics:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch lyrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
