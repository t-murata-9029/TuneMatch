'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, TextField, Rating, NoSsr, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { postReviewState } from '../../types/forms/review';
import { Music_reviews } from '@/types/db';
import { MusicReviewList } from '@/components/MusicReviewList';
import { getReviewByTrackId } from '@/utils/supabase/getReviews';

const labels: { [index: number]: string } = {
  1: '聞くに値しない',
  2: '10年に一度なら',
  3: 'まぁまぁ',
  4: '月に一回なら',
  5: '毎日きける',
};

export default function ReviewPage() {  // ← async を削除
  const dataJson = "";
  const data = dataJson ? JSON.parse(dataJson) : null;

  const router = useRouter();
  const [text, setText] = React.useState('');
  const [rating, setRating] = React.useState<number | null>(2);
  const [hover, setHover] = React.useState(-1);
  const [reviews, setReviews] = React.useState<Music_reviews[]>([]);  // ← state追加
  const [loading, setLoading] = React.useState(true);  // ← loading追加

  // useEffectでデータ取得
  React.useEffect(() => {
    if (!data?.trackId) return;

    async function fetchReviews() {
      try {
        const reviewsData = await getReviewByTrackId(data.trackId);
        setReviews(reviewsData);
      } catch (error) {
        console.error('レビュー取得エラー:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [data?.trackId]);

  const handleSubmit = () => {
    const reviewData: postReviewState = {
      review: text,
      rating: rating ?? 1,
    };
    router.push('/review/analysis');
  };

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

          {data && (
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
                  src={data.albumImage || '/noimage.png'}
                  alt="album image"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {data?.trackName}
                </Typography>
                <Box sx={{ height: 8 }} />
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                  {data?.artistName}
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

        <Typography variant="h5" component="h2" sx={{ mb: 3, mt: 4, textAlign: 'center' }}>
          「{data?.trackName}」に対してのレビュー
        </Typography>

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