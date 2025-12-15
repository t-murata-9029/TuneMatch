export type Gender = 'male' | 'female';

export interface User {
  id: string; // uuid
  username: string; // varchar
  gender: Gender; // gender (カスタム型)
  profile_text?: string | null; // text

  /* AI関連 */
  ai_vibe_score_rhythm?: number;
  ai_vibe_score_melody?: number;
  ai_vibe_score_lyric?: number;
  ai_vibe_score_production?: number;
  ai_vibe_score_emotion?: number;
  ai_vibe_score_positivity?: number;
  ai_vibe_score_negativity?: number;
  ai_vibe_score_detail_score?: number;

  /* タイムスタンプ */
  last_login_at?: Date | string | null; // timestamptz
  created_at?: Date | string | null; // timestamptz (多くの場合NOT NULLですが、オプショナルとしました)

  /* Spotify 関連トークン */
  spotify_access_token?: string | null; // text
  spotify_refresh_token?: string | null; // text
}

/**
 * VibeScoreVector
 * 8次元のvibe scoreを表すベクトルオブジェクトの型
 */
export interface VibeScoreVector {
  detail: number;
  emotional: number;
  lyric: number;
  melody: number;
  negativity: number;
  positivity: number;
  production: number;
  rhythm: number;
}

export interface Spotify_app_token {
  access_token: string;
  expires_in: number;
  created_at: Date;
}

export interface Music_reviews {
  id: number;
  user_id: string;
  track_id: string;
  review_text: string;
  rating: number;
  created_at: String;
  /*--- 外部テーブル ---*/
  users?: User;
  spotify_tracks?: Spotify_tracks
}

export interface Spotify_artists {
  id: string;
  name: string;
  image_url: string;
  genres: string[];
}

export interface Spotify_album {
  id: string;
  spotify_artists?: Spotify_artists;
  name: string;
  image_url: string;
  release_date: Date;
  total_tracks: number;
}

export interface Spotify_tracks {
  id: string;
  album_id: string;
  name: string;
  track_number: number;
  duration_ms: number;
  spotify_album?: Spotify_album;
}

export interface User_images {
  id: number;
  user_id: string;
  image_url?: string;
  priority?: number;
  is_main_profile_image?: boolean;
  uploaded_at?: Date;
}
