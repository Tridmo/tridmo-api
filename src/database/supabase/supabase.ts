import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../../config/conf';

const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
}
const supabase = createClient(supabaseConfig.appUrl, supabaseConfig.service_role, options)

export default supabase
