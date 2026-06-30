import { NextResponse } from 'next/server';
import { getClassroomTokensFromCode } from '@/lib/integrations/googleAuth';
import { supabase } from '@/lib/db/supabase';

/**
 * GET /api/integrations/classroom/callback
 * Receives the OAuth authorization code from Google, exchanges it for tokens,
 * and upserts them into the integrations table with provider='classroom'.
 * Architecture mirrors the Gmail callback exactly — same table, different provider.
 */

import { getActiveUserId } from '@/lib/auth';

// Replaced (await getActiveUserId() || '') with activeUserId logic

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    console.log('[CLASSROOM CALLBACK] [FAIL] No authorization code in URL.');
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    console.log('[CLASSROOM CALLBACK] [INFO] Exchanging code for tokens...');
    const tokens = await getClassroomTokensFromCode(code);

    if (!tokens?.access_token) {
      console.log('[CLASSROOM CALLBACK] [FAIL] Token exchange failed — no access_token returned.');
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    console.log('[CLASSROOM CALLBACK] [INFO] Tokens received. Upserting into integrations...');

    // Check for existing classroom integration row
    const { data: existing, error: selectError } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', (await getActiveUserId() || ''))
      .eq('provider', 'classroom')
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.log('[CLASSROOM CALLBACK] [FAIL] DB select error:', selectError);
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
        console.log('[CLASSROOM CALLBACK] [FAIL] Update error:', updateError);
        return NextResponse.redirect(new URL('/?error=db_update_failed', request.url));
      }
      console.log(`[CLASSROOM CALLBACK] [SUCCESS] Updated Classroom integration ${existing.id}`);
    } else {
      const { error: insertError } = await supabase
        .from('integrations')
        .insert({
          user_id: (await getActiveUserId() || ''),
          provider: 'classroom',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token ?? null,
          status: 'active',
        });

      if (insertError) {
        console.log('[CLASSROOM CALLBACK] [FAIL] Insert error:', insertError);
        return NextResponse.redirect(new URL('/?error=db_insert_failed', request.url));
      }
      console.log('[CLASSROOM CALLBACK] [SUCCESS] Inserted new Classroom integration.');
    }

    // Handle chaining
    if (state === 'chain_all') {
      console.log('[CLASSROOM CALLBACK] Chaining to Calendar...');
      return NextResponse.redirect(new URL('/api/integrations/calendar/connect?state=chain_all', request.url));
    }

    // Redirect back to dashboard
    return NextResponse.redirect(new URL('/socials', request.url));
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log('[CLASSROOM CALLBACK] [CRITICAL] Unhandled error:', msg);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}
