export const supabase = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    upsert: jest.fn(),
    delete: jest.fn(),
  })),
};
const apiKey = (import.meta?.env || importMeta.env).VITE_GEMINI_API_KEY;
const supabaseUrl = (import.meta?.env || importMeta.env).VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta?.env || importMeta.env).VITE_SUPABASE_ANON_KEY;
