'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Home() {
  const [input, setInput] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [translatedLyrics, setTranslatedLyrics] = useState('');
  const [songInfo, setSongInfo] = useState<{
    title: string;
    cleanTitle: string;
    artist: string;
    album: string;
    releaseDate: string;
    imageUrl: string;
  } | null>(null);
  const [imageError, setImageError] = useState(false);
  const [urlInfo, setUrlInfo] = useState<{ title: string; artist: string; source: string } | null>(null);

  const handleTranslate = async () => {
    setIsLoading(true);
    setError('');
    setLyrics('');
    setTranslatedLyrics('');
    setSongInfo(null);
    setUrlInfo(null);

    if (input.length < 2) {
      setError('Input must be at least 2 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      let title, artist;

      if (input.startsWith('http://') || input.startsWith('https://')) {
        // Parse URL
        const parseResponse = await fetch('/api/parse-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: input }),
        });

        if (!parseResponse.ok) {
          throw new Error('Failed to parse URL');
        }

        const parseData = await parseResponse.json();
        title = parseData.title;
        artist = parseData.artist;
        setUrlInfo({ title, artist, source: parseData.source });
      } else {
        // Split input into title and artist
        [artist, title] = input.split(' - ');
      }

      if (!title || !artist) {
        throw new Error('Invalid input format');
      }

      // Fetch lyrics from the API
      const lyricsResponse = await fetch('/api/lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, artist }),
      });

      if (!lyricsResponse.ok) {
        throw new Error('Failed to fetch lyrics');
      }

      const lyricsData = await lyricsResponse.json();

      // Check if the returned artist is 'Genius'
      if (lyricsData.songInfo.artist === 'Genius') {
        throw new Error('Unable to find the correct artist. Please try a different input format.');
      }

      setLyrics(lyricsData.lyrics);
      setSongInfo(lyricsData.songInfo);

      // Translate the fetched lyrics
      const translateResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: lyricsData.lyrics, targetLanguage: 'he' }),
      });

      if (!translateResponse.ok) {
        throw new Error('Failed to translate lyrics');
      }

      const translateData = await translateResponse.json();
      setTranslatedLyrics(translateData.translatedText);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSongInfo = () => {
    if (!songInfo) return null;

    return (
      <div className="mt-4 w-full">
        <h3 className="mb-2 text-lg font-semibold">More Information:</h3>
        <div className="rounded-md bg-secondary p-4">
          <div className="flex items-center space-x-4">
            {!imageError ? (
              <Image
                src={songInfo.imageUrl}
                alt={songInfo.title}
                width={100}
                height={100}
                className="rounded-md"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-[100px] w-[100px] items-center justify-center rounded-md bg-gray-300">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
            <div>
              <p>
                <strong>Artist:</strong> {songInfo.artist}
              </p>
              <p>
                <strong>Title:</strong> {songInfo.title}
              </p>
              <p>
                <strong>Release Date:</strong> {songInfo.releaseDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLyrics = () => {
    if (!lyrics || !translatedLyrics) return null;

    // Split lyrics into lines and filter out empty lines
    const originalLines = lyrics.split('\n').filter((line) => line.trim() !== '');
    const hebrewLines = translatedLyrics.split('\n').filter((line) => line.trim() !== '');
    const maxLines = Math.max(originalLines.length, hebrewLines.length);

    return (
      <div className="mt-4 w-full">
        <h3 className="mb-2 text-lg font-semibold">Lyrics Translation:</h3>
        <div className="rounded-md bg-secondary p-4">
          {Array.from({ length: maxLines }).map((_, index) => (
            <div key={index} className="mb-2 text-center">
              {originalLines[index] && (
                <p className="text-sm text-blue-600 dark:text-blue-400">{originalLines[index]}</p>
              )}
              {hebrewLines[index] && (
                <p className="text-sm text-red-600 dark:text-red-400" dir="rtl">
                  {hebrewLines[index]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUrlInfo = () => {
    if (!urlInfo) return null;
    return (
      <div className="mt-4 w-full">
        <h3 className="mb-2 text-lg font-semibold">URL Information:</h3>
        <div className="rounded-md bg-secondary p-4">
          <p>
            <strong>Title:</strong> {urlInfo.title}
          </p>
          <p>
            <strong>Artist:</strong> {urlInfo.artist}
          </p>
          <p>
            <strong>Source:</strong> {urlInfo.source}
          </p>
        </div>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleTranslate();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTranslate();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Translate Song to Hebrew</CardTitle>
          <CardDescription>Enter song details or paste a YouTube URL</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="input">Song Input</Label>
                <Input
                  id="input"
                  placeholder="Enter 'Artist - Title' or paste a YouTube URL"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          {/* Translate Button */}
          <Button className="w-full" onClick={handleTranslate} disabled={isLoading}>
            {isLoading ? 'Fetching...' : 'Translate'}
          </Button>

          {/* Error Message Display */}
          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          {/* Song Information */}
          {renderSongInfo()}

          {/* Rendered Lyrics */}
          {renderLyrics()}

          {/* URL Information */}
          {renderUrlInfo()}
        </CardFooter>
      </Card>
    </div>
  );
}
