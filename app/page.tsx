'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [translatedLyrics, setTranslatedLyrics] = useState('');

  const handleTranslate = async () => {
    // Reset error and loading states
    setIsLoading(true);
    setError('');
    setLyrics('');
    setTranslatedLyrics('');

    // Validate inputs
    if (songTitle.length < 2) {
      setError('Song title must be at least 2 characters long.');
      setIsLoading(false);
      return;
    }

    if (artist.length < 2) {
      setError('Artist name must be at least 2 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch lyrics
      const lyricsResponse = await fetch('/api/lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: songTitle, artist }),
      });

      if (!lyricsResponse.ok) {
        throw new Error('Failed to fetch lyrics');
      }

      const lyricsData = await lyricsResponse.json();
      setLyrics(lyricsData.lyrics);

      // Translate lyrics
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
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLyrics = () => {
    if (!lyrics || !translatedLyrics) return null;

    const originalLines = lyrics.split('\n');
    const hebrewLines = translatedLyrics.split('\n');
    const maxLines = Math.max(originalLines.length, hebrewLines.length);

    return (
      <div className="mt-4 w-full">
        <h3 className="mb-2 text-lg font-semibold">Lyrics Translation:</h3>
        <div className="rounded-md bg-secondary p-4">
          {Array.from({ length: maxLines }).map((_, index) => (
            <div key={index} className="mb-2 text-center">
              <p className="text-sm text-blue-600 dark:text-blue-400">{originalLines[index] || ' '}</p>
              <p className="text-sm text-red-600 dark:text-red-400" dir="rtl">
                {hebrewLines[index] || ' '}
              </p>
            </div>
          ))}
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
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Translate Song to Hebrew</CardTitle>
          <CardDescription>Enter the song details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="songTitle">Song Title</Label>
                <Input
                  id="songTitle"
                  placeholder="Enter song title"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  placeholder="Enter artist name"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <Button className="w-full" onClick={handleTranslate} disabled={isLoading}>
            {isLoading ? 'Fetching...' : 'Translate'}
          </Button>

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          {renderLyrics()}
        </CardFooter>
      </Card>
    </div>
  );
}
