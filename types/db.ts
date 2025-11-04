export type Gender = 'male' | 'female';

export interface User {
  id: string; // uuid
  username: string; // varchar
  gender: Gender; // gender (カスタム型)
  profile_text?: string | null; // text

  /* AI関連 */
  ai_vibe_score_rhythm?: number | null;
  ai_vibe_score_melody?: number | null;
  ai_vibe_score_lyric?: number | null;
  ai_vibe_score_production?: number | null;
  ai_vibe_score_emotion?: number | null;
  ai_vibe_score_positivity?: number | null;
  ai_vibe_score_detail_score?: number | null;

  /* タイムスタンプ */
  last_login_at?: Date | string | null; // timestamptz
  created_at?: Date | string | null; // timestamptz (多くの場合NOT NULLですが、オプショナルとしました)

  /* Spotify 関連トークン */
   spotify_access_token?: string | null; // text
   spotify_refresh_token?: string | null; // text
}