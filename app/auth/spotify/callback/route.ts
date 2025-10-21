// app/auth/spotify/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
// 💡 サーバーサイドのクッキー関数をインポート
import { cookies } from 'next/headers'; 
import { getCurrentUser } from '@/lib/action';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // 💡 サーバーサイドで HttpOnly クッキーから値を取得
    const cookieStore = cookies();
    const storedState = (await cookieStore).get('spotify_auth_state')?.value;
    const codeVerifier = (await cookieStore).get('spotify_code_verifier')?.value;
    
    // --- 認証情報の取得 (サーバーサイドのロジック) ---
    const userData = await getCurrentUser();
    const user_id = userData?.id;
    if (!user_id) {
        // サーバーサイドでのリダイレクト
        return NextResponse.redirect(new URL('/#' + new URLSearchParams({ error: 'user_id' }).toString(), request.url));
    }
    
    // --- StateとVerifierの検証 ---
    if (!code || !state || state !== storedState || !codeVerifier) {
        console.error('Validation failed: State mismatch or missing parameters.');
        
        // 💡 クリーンアップ (サーバーサイドのクッキー削除)
        // クッキーを削除するには、有効期限を過去に設定してヘッダーにセットする
        (await
            // 💡 クリーンアップ (サーバーサイドのクッキー削除)
            // クッキーを削除するには、有効期限を過去に設定してヘッダーにセットする
            cookieStore).delete('spotify_auth_state');
        (await cookieStore).delete('spotify_code_verifier');
        
        return NextResponse.redirect(new URL('/#' + new URLSearchParams({ error: 'validation_error' }).toString(), request.url));
    }

    // --- 正常処理: トークン交換など ---
    try {
        // ここで code と codeVerifier を使ってSpotify APIにアクセスし、
        // アクセストークンとリフレッシュトークンを取得する処理を行う。

        // 💡 成功したらクッキーをクリーンアップ
        (await
            // ここで code と codeVerifier を使ってSpotify APIにアクセスし、
            // アクセストークンとリフレッシュトークンを取得する処理を行う。
            // 💡 成功したらクッキーをクリーンアップ
            cookieStore).delete('spotify_auth_state');
        (await cookieStore).delete('spotify_code_verifier');

        // 成功後のリダイレクト先 (例: ダッシュボード)
        return NextResponse.redirect(new URL('/dashboard', request.url));

    } catch (error) {
        console.error('Token exchange failed:', error);
        return NextResponse.redirect(new URL('/#' + new URLSearchParams({ error: 'token_exchange_failed' }).toString(), request.url));
    }
}