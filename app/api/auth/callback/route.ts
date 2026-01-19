// pages/api/auth/callback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie, deleteCookie } from 'cookies-next';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = getCookie('spotify_auth_state', { req, res });
  const codeVerifier = getCookie('spotify_code_verifier', { req, res });

  // 1. stateの検証
  if (state === null || state !== storedState) {
    console.error('State mismatch.');
    return res.redirect('/#' + new URLSearchParams({ error: 'state_mismatch' }).toString());
  }

  // Cookieをクリーンアップ
  deleteCookie('spotify_auth_state', { req, res, path: '/' });
  deleteCookie('spotify_code_verifier', { req, res, path: '/' });

  if (!code || !codeVerifier || !CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.error('Missing required parameters.');
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  // 2. トークンの取得
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

  const data = await response.json();

  console.log(response)
  if (response.ok) {
    // 3. トークンをセッションやデータベースに保存
    // 🚨 注意: 本番環境では、トークンをセキュアなストレージ (セッション、DB) に保存してください。
    // クライアント側で直接扱うのは非推奨です。
    // ここではデモのため、一旦メインページにリダイレクトし、クエリパラメータで渡す例を示します。
    return res.redirect('/dashboard?' + new URLSearchParams({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    }).toString());
  } else {
    console.error('Token request failed:', data);
    return res.redirect('/#' + new URLSearchParams({ error: 'token_fetch_failed' }).toString());
  }
}