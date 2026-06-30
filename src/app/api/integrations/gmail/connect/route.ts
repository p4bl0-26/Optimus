import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/integrations/googleAuth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state') || undefined;
  const url = getAuthUrl(state);
  return NextResponse.redirect(url);
}
