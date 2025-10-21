// app/auth/spotify/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
// 💡 サーバーサイドのクッキー関数をインポート
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/action';
import { createClient } from '@/lib/supabase.server';
import { error } from 'console';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

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

        /* トークンを取得 */
        if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
            return NextResponse.redirect(new URL('/#' + new URLSearchParams({ error: 'token_error' }).toString(), request.url));
        }

        const tokenUrl = 'https://accounts.spotify.com/api/token';
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code as string,
                redirect_uri: REDIRECT_URI,
                code_verifier: codeVerifier as string, // PKCEに必要なverifier
            }).toString(),
        });

        /* レスポンスを取得 */
        const data = await response.json();

        console.log(data)

        /* DBに保存 */
        const supabase = await createClient();
        const { data: updateData, error: updateError } = await supabase.from("users").update({
            spotify_access_token: data["access_token"],
            spotify_refresh_token: data["refresh_token"],
        }).eq('id', user_id).select();

        console.log("updateData:" + updateData)
        console.log("updateError:" + updateError)

        return NextResponse.redirect(new URL('/dashboard', request.url));

    } catch (error) {
        console.error('Token exchange failed:', error);
        return NextResponse.redirect(new URL('/#' + new URLSearchParams({ error: 'token_exchange_failed' }).toString(), request.url));
    }
}