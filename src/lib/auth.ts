import { cookies } from 'next/headers'
import { supabase } from '@/lib/db/supabase'

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function getActiveUserId(): Promise<string | null> {
  // If judge mode cookie is present, return demo user
  const cookieStore = await cookies()
  const judgeMode = cookieStore.get('optimus_judge_mode')?.value === 'true'
  if (judgeMode) {
    return DEMO_USER_ID
  }

  // Otherwise return real user
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || null
}
