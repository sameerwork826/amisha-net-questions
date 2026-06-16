import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/clerk-react";
import { useMemo } from "react";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "./authConfig";

/**
 * A Supabase client whose requests carry the current Clerk session token, so
 * Postgres Row-Level-Security can authorise by Clerk user id (auth.jwt()->>'sub').
 * Requires Clerk's Supabase integration to be enabled in both dashboards.
 */
export function useSupabase(): SupabaseClient | null {
  const { session } = useSession();
  return useMemo(() => {
    if (!supabaseConfigured) return null;
    return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      accessToken: async () => (session ? await session.getToken() : null),
    });
  }, [session]);
}
