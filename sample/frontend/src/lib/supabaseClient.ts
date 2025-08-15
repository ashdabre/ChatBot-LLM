// import { createClient } from "@supabase/supabase-js";
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// lib/supabaseClient.ts
// import { createClient } from '@supabase/supabase-js';

// // Use import.meta.env if available, else fallback to process.env
// const supabaseUrl = (import.meta?.env?.VITE_SUPABASE_URL as string) || process.env.VITE_SUPABASE_URL!;
// const supabaseAnonKey = (import.meta?.env?.VITE_SUPABASE_ANON_KEY as string) || process.env.VITE_SUPABASE_ANON_KEY!;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// // Example helper to save chat
// export async function saveChatToDB(chat: any) {
//   return supabase.from('chats').upsert([chat]);
// }
