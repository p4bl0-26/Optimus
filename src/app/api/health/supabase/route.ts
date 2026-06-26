import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function GET() {
  try {
    const { error } = await supabase.from('integrations').select('id').limit(1);
    if (error) throw error;
    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err?.message }, { status: 503 });
  }
}
