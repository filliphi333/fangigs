import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xeqkvaqpgqyjlybexxmm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcWt2YXFwZ3F5amx5YmV4eG1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjU2MzMsImV4cCI6MjA2NDY0MTYzM30.EC5WIA84XK5W4r_1jmmzyNuy_vu5v9EG5FLkSH4JqfE'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: Debug log to verify it's working during dev
if (process.env.NODE_ENV === 'development') {
  console.log('[Supabase URL]', supabaseUrl);
  console.log('[Supabase Key]', supabaseAnonKey ? '✔️ Loaded' : '❌ Missing');
}

