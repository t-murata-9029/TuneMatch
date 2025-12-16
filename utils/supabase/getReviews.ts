import { createClient } from "@/lib/supabase.server";
import { Music_reviews } from "@/types/db";

export async function getReviewByUserId(user_id: string): Promise<Music_reviews[]> {
    const supabase = await createClient()

    // DBからuser_idをもとにレビューを取得
    const { data, error } = await supabase.from("music_reviews").select(`
    id,
    user_id,
    review_text,
    rating,
    created_at,
    users(
      username
    ),
    spotify_tracks (
      id,
      name,
      spotify_album (
        spotify_artists (
          name
        )
      )
    )
  `).eq("user_id", user_id);

    if (error) {
        throw error;
    }

    return data as unknown as Music_reviews[];
}