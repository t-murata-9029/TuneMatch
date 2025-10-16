import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // レスポンスオブジェクトを初期化
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // サーバー用Supabaseクライアントをミドルウェア内で作成
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // レスポンスに新しいクッキーを設定する
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          // クッキー削除時にもレスポンスに設定する
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 1. セッションをリフレッシュする
  // この呼び出しがクッキーをチェックし、必要に応じてSupabase Authサーバーに
  // リフレッシュリクエストを送信し、新しいセッションクッキーをセットします。
  await supabase.auth.getSession()

  // 2. 処理済みのレスポンスを返す
  return response
}

export const config = {
  // 認証のチェックが必要なパスを指定（例: /_next/staticのような静的ファイルは除外）
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - The public folder (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}