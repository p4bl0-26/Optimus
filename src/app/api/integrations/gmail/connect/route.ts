import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/integrations/googleAuth';

export async function GET() {
  const url = getAuthUrl();
  return NextResponse.redirect(url);
}
