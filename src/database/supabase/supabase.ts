import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

config({
  path: path.join(__dirname, '..', '..', '.env')
});

export const supabaseConfig = {
  appUrl: process.env.SUPABASE_APP_URL,
  anon: process.env.SUPABASE_ANON,
  service_role: process.env.SUPABASE_SERVICE_ROLE,
  password: process.env.PG_PASSWORD
}

const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
}
const supabase = createClient(supabaseConfig.appUrl, supabaseConfig.service_role, options)

export default supabase
