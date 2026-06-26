import { NextResponse } from 'next/server';
import { getCalendarTokensFromCode } from '@/lib/integrations/googleAuth';
import { supabase } from '@/lib/db/supabase';

/**
 * GET /api/integrations/calendar/callback
 * Receives the OAuth authorization code from Google, exchanges it for tokens,
 * and upserts them into the integrations table with provider='calendar'.
 */

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    console.log('[CALENDAR CALLBACK] [FAIL] No authorization code in URL.');
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    console.log('[CALENDAR CALLBACK] [INFO] Exchanging code for tokens...');
    const tokens = await getCalendarTokensFromCode(code);

    if (!tokens?.access_token) {
      console.log('[CALENDAR CALLBACK] [FAIL] Token exchange failed — no access_token returned.');
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    console.log('[CALENDAR CALLBACK] [INFO] Tokens received. Upserting into integrations...');

    // Check for existing calendar integration row
    const { data: existing, error: selectError } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', DEMO_USER_ID)
      .eq('provider', 'calendar')
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.log('[CALENDAR CALLBACK] [FAIL] DB select error:', selectError);
      return NextResponse.redirect(new URL('/?error=db_select_failed', request.url));
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('integrations')
        .update({
          access_token: tokens.access_token,
          ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.log('[CALENDAR CALLBACK] [FAIL] Update error:', updateError);
        return NextResponse.redirect(new URL('/?error=db_update_failed', request.url));
      }
      console.log(`[CALENDAR CALLBACK] [SUCCESS] Updated Calendar integration ${existing.id}`);
    } else {
      const { error: insertError } = await supabase
        .from('integrations')
        .insert({
          user_id: DEMO_USER_ID,
          provider: 'calendar',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token ?? null,
          status: 'active',
        });

      if (insertError) {
        console.log('[CALENDAR CALLBACK] [FAIL] Insert error:', insertError);
        return NextResponse.redirect(new URL('/?error=db_insert_failed', request.url));
      }
      console.log('[CALENDAR CALLBACK] [SUCCESS] Inserted new Calendar integration.');
    }

    // Redirect back to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log('[CALENDAR CALLBACK] [CRITICAL] Unhandled error:', msg);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}
