// pages/api/spotify/me.ts
import { NextApiRequest, NextApiResponse } from 'next';

// 🚨 トークンを安全に取得する処理に置き換えてください (例: DB/セッションから)
const getAccessTokenFromSecureStorage = (req: NextApiRequest): string | null => {
    // ここでは簡略化のため、リクエストヘッダーから直接取得すると仮定しますが、
    // 実際にはユーザーのセッションやDBから取得すべきです。
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = getAccessTokenFromSecureStorage(req);

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized: No access token provided.' });
  }

  try {
    const spotifyResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!spotifyResponse.ok) {
      // エラー処理（トークン切れなど）
      console.error('Spotify API Error:', spotifyResponse.status);
      return res.status(spotifyResponse.status).json({ error: 'Failed to fetch data from Spotify.' });
    }

    const userData = await spotifyResponse.json();
    return res.status(200).json(userData);

  } catch (error) {
    console.error('Error fetching Spotify user data:', error);
    return res.status(500).json({ error: 'Internal Server Error.' });
  }
}