// src/setupTests.js
// Jest setup file

// extend jest-dom (use require for Jest compatibility)
import '@testing-library/jest-dom';
// polyfill fetch
require('whatwg-fetch');

// Put safe dummy environment variables for tests here
process.env.VITE_GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || 'test_gemini_key';
process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://test-supabase.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'test-supabase-anon-key';

// Optional: global for importMeta if some helper expects it
globalThis.__TEST_IMPORT_META = {
  env: {
    VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  },
};
