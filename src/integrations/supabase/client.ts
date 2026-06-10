import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase client instance.
 *
 * Returns null if Cloud Backend database is not enabled yet.
 * The database can be enabled via the chat by asking the AI to enable it.
 *
 * Usage:
 * ```typescript
 * import { supabase } from '@/integrations/supabase/client';
 *
 * if (!supabase) {
 *   // Database not enabled - handle gracefully
 *   return;
 * }
 *
 * const { data } = await supabase.from('todos').select('*');
 * ```
 */
export const supabase: SupabaseClient<Database> | null = supabaseUrl && supabaseAnonKey ? createClient<Database>(supabaseUrl, supabaseAnonKey) : null;
