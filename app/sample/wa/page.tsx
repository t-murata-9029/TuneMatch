import { MusicReviewCard } from "@/components/MusicReviewCard";
import { createAdminClient } from "@/lib/supabase.admin"
import { Music_reviews, Spotify_tracks } from "@/types/db";
import { createClient } from "@supabase/supabase-js"

export default async function page() {
  const supabase = createAdminClient();

  const { data: reviews, error } = await supabase
    .from('music_reviews')
    .select(`
    id,
    user_id,
    review_text,
    rating,
    created_at,
    users(
      username
    ),
    spotify_tracks (
      name,
      spotify_album (
        spotify_artists (
          name
        )
      )
    )
  `)
    .order('created_at', { ascending: false });

  console.log(error);

  const list = reviews as unknown as Music_reviews[];
  
  list.map((a) => (
    console.log(a.spotify_tracks)
  ))

  return (
    <>
      {list.map((review) => (
        <MusicReviewCard review={review} key={review.id} />
      ))
      }
    </>
  )
}