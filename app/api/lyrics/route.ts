import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Genius API base URL
const GENIUS_API_BASE_URL = 'https://api.genius.com';

// Function to search for a song using the Genius API
async function searchSong(title: string, artist: string) {
  console.log(`Searching for song: "${title}" by ${artist}`);
  try {
    // Make a GET request to the Genius API search endpoint
    const response = await axios.get(`${GENIUS_API_BASE_URL}/search`, {
      headers: {
        Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
      },
      params: {
        q: `${title} ${artist}`,
      },
    });

    console.log('Search response:', response.data);
    // Extract the first result from the API response
    const result = response.data.response.hits[0]?.result;
    if (!result) {
      console.log('No results found for the given song and artist');
      return null;
    }
    return result;
  } catch (error) {
    // Handle and log errors
    if (error instanceof Error) {
      console.error('Error searching for song:', error.message);
    } else {
      console.error('Unknown error occurred while searching for song');
    }
    throw new Error('Failed to search for song');
  }
}

// Function to fetch and extract lyrics from a Genius song page
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

  console.log('Extracted and cleaned lyrics length:', lyrics?.length);
  return lyrics;
}

// API route handler for POST requests
export async function POST(request: Request) {
  try {
    const { title, artist } = await request.json();
    console.log(`Received request for lyrics: "${title}" by ${artist}`);

    // Search for the song using the Genius API
    const song = await searchSong(title, artist);
    if (!song) {
      console.log('Song not found');
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Fetch and extract lyrics from the Genius song page
    const lyrics = await fetchLyrics(song.url);
    if (!lyrics) {
      console.log('Lyrics not found');
      return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 });
    }

    console.log('Successfully fetched lyrics');
    return NextResponse.json({ lyrics });
  } catch (error) {
    // Handle and log errors
    console.error('Error fetching lyrics:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch lyrics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
