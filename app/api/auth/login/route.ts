    // app/api/auth/login/route.ts
    
    import { NextResponse } from 'next/server';
    import { generateRandomString, generateCodeChallenge } from '@/utils/auth';
    import { cookies } from 'next/headers'; // App Routerではこれを使う
    
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    // NOTE: VercelやNetlifyなどでは NEXT_PUBLIC_... はクライアントコードでも公開されるため、
    // サーバーサイドでのみ使うREDIRECT_URIは NEXT_PUBLIC をつけない方がセキュリティ上望ましい
    const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
    const SCOPES = 'user-read-private user-read-email playlist-read-private';
    
    // 💡 認証開始はGETリクエストで行うのが一般的です
    export async function GET() {
      // 環境変数のチェック
      if (!CLIENT_ID || !REDIRECT_URI) {
        // 500エラーを返す
        return NextResponse.json(
          { error: 'Server configuration error: Environment variables are not set.' },
          { status: 500 }
        );
      }
    
      const state = generateRandomString(16);
      const codeVerifier = generateRandomString(128);
    
      // PKCEに必要なcode_challengeを生成
      const codeChallenge = await generateCodeChallenge(codeVerifier);
    
      // 💡 Cookieの保存 (App Routerの組み込みcookies()を使用)
      const cookieStore = cookies();
      (await cookieStore).set('spotify_auth_state', state, { maxAge: 3600, path: '/', httpOnly: true }); // httpOnlyを付ける
      (await cookieStore).set('spotify_code_verifier', codeVerifier, { maxAge: 3600, path: '/', httpOnly: true });
    
      // 認証URLを構築
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: SCOPES, // 💡 `scope`は大文字ではなく小文字が一般的
        redirect_uri: REDIRECT_URI,
        state: state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
      }).toString();
    
      // 修正: Spotifyの正式な認証エンドポイントを使用
      const authUrl = new URL("https://accounts.spotify.com/authorize") 
      authUrl.search = new URLSearchParams(params).toString();
      // 💡 リダイレクトの実行 (NextResponse.redirectを使用)
      return NextResponse.redirect(authUrl);
    }