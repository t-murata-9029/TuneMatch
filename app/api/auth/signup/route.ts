import { createClient } from '@/lib/supabase.server'
import { NextResponse } from 'next/server'

export async function POST(request: { url: string | URL; json: () => any }) {
    const requestUrl = new URL(request.url)
    const formData = await request.json()

    // JSONからアカウント作成に必要な情報を取得
    const email = formData.email
    const password = formData.password
    const username = formData.username
    const profile_text = formData.profile_text
    const gender = formData.gender

    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
                profile_text,
                gender,
            },
        },
    });

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