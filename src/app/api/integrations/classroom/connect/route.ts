import { NextResponse } from 'next/server';
import { getClassroomAuthUrl } from '@/lib/integrations/googleAuth';

/**
 * GET /api/integrations/classroom/connect
 * Redirects user to Google OAuth consent screen with Classroom scopes.
 * Reuses existing Google OAuth client — same credentials as Gmail.
 */
export async function GET() {
  const url = getClassroomAuthUrl();
  return NextResponse.redirect(url);
}
