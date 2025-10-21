// app/api/auth/login/route.js (POST handler)

import { createClient } from '@/lib/supabase.server'
import { NextResponse } from 'next/server'

export async function POST(request: { url: string | URL; json: () => any }) {
  const requestUrl = new URL(request.url)
  const formData = await request.json() // JSONで受け取る

  const email = formData.email
  const password = formData.password

  // サーバー側でクッキーにアクセスしてSupabaseクライアントを作成
  const supabase = await createClient()

  // ユーザーのサインイン（認証に成功すると、Supabaseがクッキーを設定する）
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // 認証失敗
    console.error('Login Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // 認証成功
  // クッキーは既にSupabaseによって設定されているため、リダイレクトする
  // ログイン成功後のリダイレクト先を指定
  return NextResponse.json({ success: true }, { status: 200 })
}