'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, TextField, Rating, NoSsr, Typography, CircularProgress } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { postReviewState } from '../../types/forms/review';
import { Music_reviews } from '@/types/db';
import { MusicReviewList } from '@/components/MusicReviewList';
import { getReviewByTrackId } from '@/utils/supabase/getReviews';
import ArtistLink from '@/components/ArtistLink';
import { supabase } from '@/lib/supabase.cliant';

const labels: { [index: number]: string } = {
  1: '聞くに値しない',
  2: '10年に一度なら',
  3: 'まぁまぁ',
  4: '月に一回なら',
  5: '毎日きける',
};

type item = {
  artistId: string;
  artistName: string;
  albumId: string;
  albumName: string;
  albumImage: string;
  albumReleaseDate: string;
  albumTotalTracks: number;
  trackId: string;
  trackName: string;
  trackNumber: number;
  durationMs: number
};

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const encodedData = searchParams.get('data');
  const trackIdParam = searchParams.get('trackId');

  const data: item | null = encodedData
    ? JSON.parse(decodeURIComponent(atob(encodedData))) as item
    : null;

  const router = useRouter();
  const [text, setText] = React.useState('');
  const [rating, setRating] = React.useState<number | null>(2);
  const [hover, setHover] = React.useState(-1);
  const [reviews, setReviews] = React.useState<Music_reviews[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [trackData, setTrackData] = React.useState<item | null>(data);
  const [loadingTrackData, setLoadingTrackData] = React.useState(!data && trackIdParam ? true : false);

  // trackIdからトラック情報を取得
  React.useEffect(() => {
    const fetchTrackData = async () => {
      if (!trackIdParam || data) {
        setLoadingTrackData(false);
        return;
      }

      try {
        // ① トラックとアルバム情報を取得
        const { data: trackInfo, error: trackError } = await supabase
          .from('spotify_tracks')
          .select(`
            id,
            name,
            track_number,
            duration_ms,
            album_id,
            spotify_album (
              id,
              name,
              image_url,
              release_date,
              total_tracks,
              artist_id
            )
          `)
          .eq('id', trackIdParam)
          .single();

        if (trackError || !trackInfo) {
          console.error('トラック取得エラー:', trackError);
          setLoadingTrackData(false);
          return;
        }

        // ② アルバム情報からartist_idを取得
        const album = trackInfo.spotify_album as any;
        const artistId = album?.artist_id;

        if (!artistId) {
          console.error('アーティストIDが見つかりません');
          setLoadingTrackData(false);
          return;
        }

        // ③ アーティスト情報を別途取得
        const { data: artistInfo, error: artistError } = await supabase
          .from('spotify_artists')
          .select('id, name')
          .eq('id', artistId)
          .single();

        if (artistError || !artistInfo) {
          console.error('アーティスト取得エラー:', artistError);
          setLoadingTrackData(false);
          return;
        }

        const formattedData: item = {
          artistId: artistInfo.id,
          artistName: artistInfo.name,
          albumId: album?.id || '',
          albumName: album?.name || '',
          albumImage: album?.image_url || '',
          albumReleaseDate: album?.release_date || '',
          albumTotalTracks: album?.total_tracks || 0,
          trackId: trackInfo.id,
          trackName: trackInfo.name,
          trackNumber: trackInfo.track_number,
          durationMs: trackInfo.duration_ms,
        };

        setTrackData(formattedData);
        setLoadingTrackData(false);
      } catch (err) {
        console.error('トラック情報取得エラー:', err);
        setLoadingTrackData(false);
      }
    };

    fetchTrackData();
  }, [trackIdParam, data]);

  React.useEffect(() => {
    const trackId = trackData?.trackId;
    if (!trackId) {
      setLoading(false);
      return;
    }

    async function fetchReviews() {
      try {
        const reviewsData = await getReviewByTrackId(trackId!);
        setReviews(reviewsData);
      } catch (error) {
        console.error('レビュー取得エラー:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [trackData?.trackId]);

  const handleSubmit = () => {
    const reviewData: postReviewState = {
      review: text,
      rating: rating ?? 1,
    };

    const encodedReview = btoa(encodeURIComponent(JSON.stringify(reviewData)));
    const encodedTrackData = btoa(encodeURIComponent(JSON.stringify(trackData)));
    router.push(`/review/analysis?review=${encodedReview}&data=${encodedTrackData}`);
  };

  if (loadingTrackData) {
    return (
      <NoSsr>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </NoSsr>
    );
  }

  return (
    <NoSsr>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '80%', maxWidth: 500 }}>
          <Typography variant="h5" fontWeight="bold">
            {'レビュー投稿画面'}
          </Typography>

          {trackData && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Box
                sx={(theme) => ({
                  width: 100,
                  height: 100,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `2px solid ${theme.palette.mode === 'dark' ? '#ffffff' : '#000000'}`,
                  flexShrink: 0,
                })}
              >
                <img
                  src={trackData.albumImage || '/noimage.png'}
                  alt="album image"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {trackData.trackName}
                </Typography>
                <Box sx={{ height: 8 }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                  <ArtistLink artistId={trackData.artistId} artistName={trackData.artistName} />
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating
              name="hover-feedback"
              value={rating}
              precision={1}
              onChange={(event, value) => setRating(value)}
              onChangeActive={(event, hoverValue) => setHover(hoverValue)}
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
            {rating !== null && <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : rating]}</Box>}
          </Box>

          <TextField
            label="レビュー"
            multiline
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{ width: '100%' }}
          />

          <Button
            variant="outlined"
            onClick={handleSubmit}
            sx={{ width: 'auto', alignSelf: 'flex-end', px: 3, py: 1.5 }}
          >
            レビュー投稿
          </Button>
        </Box>

        {trackData && (
          <Typography variant="h5" component="h2" sx={{ mb: 3, mt: 4, textAlign: 'center' }}>
            「{trackData.trackName}」に対してのレビュー
          </Typography>
        )}

        <Box id="review_list">
          {loading ? (
            <Typography sx={{ textAlign: 'center', p: 3 }}>読み込み中...</Typography>
          ) : reviews.length !== 0 ? (
            <MusicReviewList reviews={reviews} noTitle={true} noMusicPlayer={true} />
          ) : (
            <Typography sx={{ textAlign: 'center', p: 3 }}>
              レビューを投稿していないようです。
            </Typography>
          )}
        </Box>
      </Box >
    </NoSsr>
  );
}