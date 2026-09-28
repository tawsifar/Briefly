import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://awdkmuutgmundgnzpcgk.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZGttdXV0Z211bmRnbnpwY2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDk5MTUsImV4cCI6MjEwNjE4NTkxNX0.oyfgi-W9Q3SZZ-XzA8aeIcQVmdIyVKdHOfpn7fgmgpU";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient(url, key);
}
