import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://cycveijssachnwlixeiw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5Y3ZlaWpzc2FjaG53bGl4ZWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjI0MDcsImV4cCI6MjA3MzM5ODQwN30.66Y24ZTi3cjWQr7aqqnC2xE7ODiLj9IEhk5l7U5WezM";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
