import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        // ミドルウェアでセッションがリフレッシュされる場合、このsetAllは無視しても問題ありません。
        // （ミドルウェアのセットアップが推奨されています）
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(async ({ name, value, options }) =>
              (await cookieStore).set(name, value, options)
            )
          } catch (e) {
            // Server Componentから`setAll`が呼ばれた場合、
            // cookies.set()は読み取り専用エラーを発生させます。
            // ミドルウェアでセッションリフレッシュを処理する場合は無視します。
          }
        },
      },
    }
  )
}