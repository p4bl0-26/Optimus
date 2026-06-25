import { NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/integrations/googleAuth';
import { supabase } from '@/lib/db/supabase';

// For the demo we use a fixed user ID
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    console.error('[GMAIL CALLBACK] [FAIL] No authorization code provided in URL.');
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    console.log('[GMAIL CALLBACK] [INFO] Exchanging code for tokens...');
    const tokens = await getTokensFromCode(code);
    
    if (!tokens || !tokens.access_token) {
      console.error('[GMAIL CALLBACK] [FAIL] Failed to retrieve access token from Google.');
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    console.log('[GMAIL CALLBACK] [INFO] Tokens received. Updating database...');
    const { data: existing, error: selectError } = await supabase
      .from('integrations')
      .select('id')
      .eq('user_id', DEMO_USER_ID)
      .eq('provider', 'gmail')
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[GMAIL CALLBACK] [FAIL] Error checking existing integration:', selectError);
      return NextResponse.redirect(new URL('/?error=db_select_failed', request.url));
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('integrations')
        .update({
          access_token: tokens.access_token,
          ...(tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {}),
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
        
      if (updateError) {
         console.error('[GMAIL CALLBACK] [FAIL] Failed to update integration tokens:', updateError);
         return NextResponse.redirect(new URL('/?error=db_update_failed', request.url));
      }
      console.log(`[GMAIL CALLBACK] [SUCCESS] Updated existing integration ${existing.id}`);
    } else {
      const { error: insertError } = await supabase
        .from('integrations')
        .insert({
          user_id: DEMO_USER_ID,
          provider: 'gmail',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          status: 'active'
        });
        
      if (insertError) {
         console.error('[GMAIL CALLBACK] [FAIL] Failed to insert new integration tokens:', insertError);
         return NextResponse.redirect(new URL('/?error=db_insert_failed', request.url));
      }
      console.log('[GMAIL CALLBACK] [SUCCESS] Inserted new integration tokens');
    }

    // Redirect back to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error: any) {
    console.error('[GMAIL CALLBACK] [CRITICAL] Error in Google callback:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}
