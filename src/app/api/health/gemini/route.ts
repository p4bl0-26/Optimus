import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
    // Just instantiate — do not make a real API call to avoid cost
    new GoogleGenerativeAI(apiKey);
    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err?.message }, { status: 503 });
  }
}
