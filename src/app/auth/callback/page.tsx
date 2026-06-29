'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/db/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      // Supabase's PKCE flow automatically exchanges the code for a session
      // via the implicitly included auth listener, but we will explicitly wait
      // for the session to exist.
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Callback error:", error);
        if (isMounted) router.replace('/?auth=failed');
        return;
      }

      if (session) {
        // Set local storage flag as requested
        localStorage.setItem("optimus_auth", "true");
        
        // Remove any stale judge state
        localStorage.removeItem("optimus_judge");
        localStorage.removeItem("optimus_judge_mode");
        
        // Redirect to dashboard
        if (isMounted) router.replace('/');
      } else {
        // Fallback check, wait a bit for the session to establish from URL hash
        setTimeout(async () => {
          const { data: { session: delayedSession } } = await supabase.auth.getSession();
          if (delayedSession) {
            localStorage.setItem("optimus_auth", "true");
            localStorage.removeItem("optimus_judge");
            localStorage.removeItem("optimus_judge_mode");
            if (isMounted) router.replace('/');
          } else {
            if (isMounted) router.replace('/?auth=failed');
          }
        }, 1500);
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--color-bg-primary)] flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 rounded-full border-2 border-[var(--color-accent-primary)]/30 border-t-[var(--color-accent-primary)] animate-spin" />
      <h1 className="text-xl md:text-2xl font-bold font-orbitron tracking-widest text-[var(--color-text-primary)] uppercase">
        AUTHENTICATING OPERATOR...
      </h1>
    </div>
  );
}
