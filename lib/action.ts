'use server'

import { getUser } from '@/lib/supabase.server'

export async function getCurrentUser() {
  return getUser()
}
