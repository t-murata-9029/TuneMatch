import { Typography } from "@mui/material";
import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie, deleteCookie } from 'cookies-next';
import { cookies } from 'next/headers'; // next/headers からインポート

//クエリパラメーター
type Props = {
    searchParams: {
        code: string;
        state: string;
    }
};

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

export default async function callback(props: Props, req: NextApiRequest, res: NextApiResponse) {
    /* パラメーターからcodeとstate取得 */
    const code = props.searchParams.code;
    const state = props.searchParams.state;

    /* Cookieから取得 */
    const cookieStore = cookies();
    const storedState = (await cookieStore).get('spotify_auth_state')?.value;
    const codeVerifier = (await cookieStore).get('spotify_code_verifier')?.value;

    /* stateを検証 */
    if (state === null || state !== storedState) {
        console.error('State mismatch.');
        return res.redirect('/#' + new URLSearchParams({ error: 'state_mismatch' }).toString());
    }

    /* Cookieをクリーンアップ */
    deleteCookie('spotify_auth_state', { req, res, path: '/' });
    deleteCookie('spotify_code_verifier', { req, res, path: '/' });

    if (!code || !codeVerifier || !CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
        console.error('Missing required parameters.');
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    /* トークンを取得 */
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

    if (response.ok) {
    // 3. トークンをセッションやデータベースに保存
    // 🚨 注意: 本番環境では、トークンをセキュアなストレージ (セッション、DB) に保存してください。
    // クライアント側で直接扱うのは非推奨です。
    // ここではデモのため、一旦メインページにリダイレクトし、クエリパラメータで渡す例を示します。
    /*
    return res.redirect('/dashboard?' + new URLSearchParams({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    }).toString());
    */
   return (
        <>
            <Typography>Spotify連携完了</Typography>
        </>
   );

  } else {
    return (
        <>
            <Typography>Spotify連携に失敗しました。</Typography>
        </>
    );
  }
}