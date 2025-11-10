// Node.jsの機能なのでNext.jsのAPI Routeで安全に使用できます。
import { createClient } from '@/lib/supabase.server';
import { Buffer } from 'buffer';
import { error } from 'console';
import { NextResponse } from 'next/server';

// 環境変数からクライアントIDとシークレットを取得
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// 認証文字列をBase64エンコード
const authString = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

export async function refreshToken() {
    // 環境変数が設定されているか確認
    if (!client_id || !client_secret) {
        return error;
    }

    const tokenUrl = 'https://accounts.spotify.com/api/token';

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials'
            })
        });

        // レスポンスが成功したか確認
        if (!response.ok) {
            const errorBody = await response.json();
            return NextResponse.json(
                { error: 'Client ID or Secret is not configured.\n' + errorBody },
                { status: 500 }
            );
        }

        const data = await response.json();
        const token = data.access_token;

        // DBに保存
        const supabase = await createClient();
        await supabase.from("spotify_app_token").delete().select();
        const { error } = await supabase.from("spotify_app_token").insert({
            access_token: token,
            expires_in: data.expires_in,
        }).select()

        if(error){
            console.log(error)
        }

        return token;

    } catch (error) {
        return error;
    }
}