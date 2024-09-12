import { NextResponse } from 'next/server';
import { translate } from '@vitalets/google-translate-api';

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json();
    const result = await translate(text, { to: targetLanguage });
    return NextResponse.json({ translatedText: result.text });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 });
  }
}
