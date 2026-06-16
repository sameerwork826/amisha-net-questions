// Auth / backend configuration, read from Vite env vars at build time.
// The app works fully WITHOUT these (history stays local). When the Clerk key
// is present, sign-in is enabled; when Supabase vars are also present, history
// syncs to the cloud so it follows the user across devices.

export const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as
  | string
  | undefined;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const clerkEnabled = Boolean(CLERK_KEY);
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
