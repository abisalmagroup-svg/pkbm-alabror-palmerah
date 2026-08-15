import { createClient } from '@supabase/supabase-js';

// Helper to ensure we always pass a valid URL to Supabase client
const getValidUrl = (url: any): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://placeholder-url.supabase.co';
  }
  try {
    let cleanUrl = url.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
    new URL(cleanUrl);
    return cleanUrl;
  } catch {
    return 'https://placeholder-url.supabase.co';
  }
};

const supabaseUrl = getValidUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim() || 'placeholder-anon-key';

if (supabaseUrl === 'https://placeholder-url.supabase.co') {
  console.warn('Supabase URL or Anon Key is missing or invalid. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}

export const isSupabaseConfigured = supabaseUrl !== 'https://placeholder-url.supabase.co';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
