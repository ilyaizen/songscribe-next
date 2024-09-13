import { NextResponse } from 'next/server';
import { translate } from '@vitalets/google-translate-api';

// API route handler for POST requests
export async function POST(request: Request) {
  try {
    // Extract text and target language from the request body
    const { text, targetLanguage } = await request.json();

    // Translate the text using the Google Translate API
    const result = await translate(text, { to: targetLanguage });

    // Return the translated text as a JSON response
    return NextResponse.json({ translatedText: result.text });
  } catch (error) {
    // Handle and log translation errors
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 });
  }
}
