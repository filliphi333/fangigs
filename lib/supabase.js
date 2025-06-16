import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xeqkvaqpgqyjlybexxmm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcWt2YXFwZ3F5amx5YmV4eG1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjU2MzMsImV4cCI6MjA2NDY0MTYzM30.EC5WIA84XK5W4r_1jmmzyNuy_vu5v9EG5FLkSH4JqfE'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log(supabaseUrl, supabaseAnonKey); // Check if values are correct

