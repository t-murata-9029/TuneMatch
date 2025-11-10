import { createClient } from "@/lib/supabase.server";
import { NextResponse } from "next/server";
import { Spotify_app_token } from "@/types/db"; // expires_in が seconds のため、expires_at に変換が必要です
import { refreshToken } from "@/utils/spotify/refreshToken";

/**
 * アプリで使うSpotifyのトークンを取得し、必要ならリフレッシュする
 * @returns {Promise<string | null>} 有効なアクセストークン、またはnull
 */
export async function GET() {
    /*--- DBからトークン情報を取得 ---*/
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("spotify_app_token")
        .select("access_token, expires_in, created_at");

    if (error) {
        console.error("Supabase error fetching token:", error);
        throw new Error('Database error fetching Spotify token.');
    }

    // supabaseにトークンが存在するか
    if (data && data.length != 0) {
        const databaseSpotifyToken: Spotify_app_token[] = data || [];
        const tokenRecord = databaseSpotifyToken[0];

        /*--- 有効期限を確認 ---*/
        const now = new Date();
        const expiryTime = new Date(tokenRecord.created_at);
        // 期限の30秒前にリフレッシュする
        expiryTime.setSeconds(expiryTime.getSeconds() + tokenRecord.expires_in - 30);

        // 有効期限内の場合そのまま返す
        if (now < expiryTime) {
            return NextResponse.json(
                { "token": tokenRecord.access_token },
                { status: 200 }
            );
        }
    }

    /*--- トークンを再取得 ---*/
    const token = await refreshToken();
    return NextResponse.json(
                { token },
                { status: 200 }
            );
}