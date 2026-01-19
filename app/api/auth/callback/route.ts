import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // クッキー操作用

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // クッキーの取得
  const cookieStore = await cookies();
  const storedState = cookieStore.get('spotify_auth_state')?.value;
  const codeVerifier = cookieStore.get('spotify_code_verifier')?.value;

  // 1. stateの検証
  if (state === null || state !== storedState) {
    console.error('State mismatch.');
    return NextResponse.redirect(`${origin}/#error=state_mismatch`);
  }

  // Cookieをクリーンアップ（削除）
  cookieStore.delete('spotify_auth_state');
  cookieStore.delete('spotify_code_verifier');

  if (!code || !codeVerifier || !CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.error('Missing required parameters.');
    return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
  }

  // 2. トークンの取得
  const tokenUrl = 'https://accounts.spotify.com/api/token'; // URLを修正
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }).toString(),
  });

  const data = await response.json();

  if (response.ok) {
    // 3. トークンを付けてダッシュボードへリダイレクト
    const dashboardUrl = new URL('/dashboard', origin);
    dashboardUrl.searchParams.set('access_token', data.access_token);
    dashboardUrl.searchParams.set('refresh_token', data.refresh_token);
    dashboardUrl.searchParams.set('expires_in', data.expires_in.toString());

    return NextResponse.redirect(dashboardUrl.toString());
  } else {
    console.error('Token request failed:', data);
    return NextResponse.redirect(`${origin}/#error=token_fetch_failed`);
  }
}