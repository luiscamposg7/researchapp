import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://brbnyeybtofvekxqhwgb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyYm55ZXlidG9mdmVreHFod2diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzIwNzEsImV4cCI6MjA4ODc0ODA3MX0.tEVzF-U8hDAf7V7oBSXYRBQlzvO153uYCcp5SdrvFqk',
  {
    auth: {
      flowType: 'implicit',
      detectSessionInUrl: true,
      persistSession: true,
    }
  }
);

