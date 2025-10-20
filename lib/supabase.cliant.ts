import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  // 💡 ここに実際のURL (string) が渡されているか確認
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  // 💡 ここに実際のAnon Key (string) が渡されているか確認
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
