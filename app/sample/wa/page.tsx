import { MusicReviewCard } from "@/components/MusicReviewCard";
import { MusicReviewList } from "@/components/MusicReviewList";
import { createAdminClient } from "@/lib/supabase.admin"
import { Music_reviews, Spotify_tracks } from "@/types/db";
import { Box } from "@mui/material";
import { createClient } from "@supabase/supabase-js"
import { RadarChart } from '@mui/x-charts/RadarChart';

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
      id,
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

  return (
    <>

      <RadarChart
        height={300}
        series={[{ label: 'Lisa', data: [120, 98, 86, 99, 85, 65,100] }]}
        radar={{
          max: 120,
          metrics: ['Math', 'Chinese', 'English', 'Geography', 'Physics', 'History', 'Art'],
        }}
      />


    </>
  )
}