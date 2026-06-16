import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useSupabase } from "../lib/supabase";
import { progressActions, useProgress } from "../hooks/useProgress";

/**
 * Headless component (renders nothing). When the user is signed in and Supabase
 * is configured, it loads their saved history once, merges it with whatever is
 * local, then debounce-saves the merged history back on every change.
 *
 * Only mount this inside <ClerkProvider> (i.e. when clerkEnabled).
 */
export default function ProgressSync() {
  const { userId, isSignedIn } = useAuth();
  const supabase = useSupabase();
  const state = useProgress();
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load + merge remote history once after sign-in.
  useEffect(() => {
    if (!isSignedIn || !supabase || !userId || loaded.current) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();
      if (!cancelled && !error && data?.data) {
        progressActions.mergeRemote(data.data);
      }
      loaded.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, supabase, userId]);

  // Reset the "loaded" guard when the user changes / signs out.
  useEffect(() => {
    if (!isSignedIn) loaded.current = false;
  }, [isSignedIn, userId]);

  // Debounced save on every change.
  useEffect(() => {
    if (!isSignedIn || !supabase || !userId || !loaded.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void supabase.from("user_progress").upsert({
        user_id: userId,
        data: state,
        updated_at: new Date().toISOString(),
      });
    }, 1500);
    return () => clearTimeout(timer.current);
  }, [state, isSignedIn, supabase, userId]);

  return null;
}
