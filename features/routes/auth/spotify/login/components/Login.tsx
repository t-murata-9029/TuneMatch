'use client'

// pages/index.tsx (またはpages/dashboard.tsx)
import { useEffect, useState } from 'react';

interface UserProfile {
  display_name: string;
  id: string;
  images: Array<{ url: string }>;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  /**
   * Spotify認証API Routeへリダイレクトを開始する関数
   * * この関数は、ブラウザをNext.jsのAPI RouteのURLに遷移させます。
   * これにより、サーバー側で /api/auth/login.ts の handler 関数が実行されます。
   */
  const handleLogin = () => {
    // window.location.href に設定することで、ブラウザがこのURLにアクセスし、
    // サーバーサイドの handler 関数を実行させることができます。
    window.location.href =  '/api/spotify/login'
  };

  // 認証後のURLからトークンを抽出する（デモ目的）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token'); 
    
    if (token) {
      setAccessToken(token);
      // URLからトークンを削除 (セキュリティのため)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 取得したトークンを使ってAPIからデータをフェッチ
  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        // API Route '/api/spotify/me' を呼び出し
        const response = await fetch('/api/spotify/me', {
          headers: {
            // サーバー側のAPI Routeにトークンを渡す
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error('Failed to fetch profile.');
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Spotify API Integration Example</h1>

      {user ? (
        <div>
          <h2>Welcome, {user.display_name}!</h2>
          <p>Spotify ID: {user.id}</p>
          {user.images?.[0]?.url && <img src={user.images[0].url} alt="Profile" style={{ width: 100 }} />}
          <p>これでSpotifyのデータを使ってアプリケーションを構築できます。</p>
        </div>
      ) : (
        <a 
          href="#" 
          style={{ padding: '10px 20px', backgroundColor: '#1DB954', color: 'white', textDecoration: 'none', borderRadius: '500px' }} 
          // ここで handleLogin 関数を呼び出す
          onClick={(e) => {
            e.preventDefault(); // aタグのデフォルト動作をキャンセル
            handleLogin(); // API Routeへのリダイレクトを開始
          }}
        >
          Login with Spotify
        </a>
      )}
    </div>
  );
}