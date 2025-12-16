// MusicReviewCard.tsx

import {
  Card,
  CardContent,
  Typography,
  Rating,
  Box,
  Divider,
  Stack,
  colors,
  Link
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Music_reviews } from '@/types/db';

interface MusicReviewCardProps {
  review: Music_reviews;
  noTitle?: boolean;
  noMusicPlayer?: boolean;
}

/**
 * 1件の音楽レビューを表示するためのコンポーネント
 */
export const MusicReviewCard = ({ review, noTitle = false, noMusicPlayer = false }: MusicReviewCardProps) => {
  const dateObject = new Date(review.created_at.toString());

  const formattedDate = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(dateObject);

  // spotify:track:xxxxxxxxxxxx の形式から、埋め込み可能な URL に変換
  const getEmbedUrl = (uri: string) => {
    // 例: "spotify:track:5FVd6MexzT6Bf9cUhCzozV" -> "5FVd6MexzT6Bf9cUhCzozV"
    const id = uri.split(':').pop();
    return `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`;
  };

  // review.spotify_tracksが存在し、かつURIが存在する場合のみ埋め込みURLを生成
  const embedUrl = review.spotify_tracks?.id ? getEmbedUrl(review.spotify_tracks.id) : null;

  // CardのmaxWidthを埋め込みプレイヤーの一般的なサイズに合わせて調整
  const CARD_MAX_WIDTH = 500;

  return (
    <Card
      sx={{
        maxWidth: CARD_MAX_WIDTH,
        margin: '16px auto',
        boxShadow: 3,
        border: `1px solid ${colors.grey[200]}`
      }}
    >
      <CardContent>
        {/* 曲名とアーティスト名 */}

        {!noTitle &&
          <>
            <Stack mb={1}>
              <Typography variant="h5" component="div" fontWeight="bold" sx={{ color: colors.blueGrey[800] }}>
                {review.spotify_tracks?.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {review.spotify_tracks?.spotify_album?.spotify_artists?.name}
              </Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
          </>
        }

        {/* レビュー評価とユーザーID */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          {/* 評価 (Rating) */}
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1" fontWeight="bold" mr={1}>
              評価:
            </Typography>
            <Rating value={review.rating} precision={0.5} readOnly size="medium" />
            <Typography variant="body2" ml={1} color="text.secondary">
              ({review.rating} / 5)
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" color="text.secondary">
            <AccountCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              投稿者:
              <Link href={"/user/" + review.user_id} >{review.users?.username}</Link>
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* レビューテキスト */}
        <Typography
          variant="body1"
          gutterBottom
          sx={{ whiteSpace: 'pre-wrap', minHeight: '60px' }}
        >
          {review.review_text}
        </Typography>

        <Divider sx={{ mt: 2, mb: 1.5 }} />

        {/* Spotify 埋め込みプレイヤー */}
        {embedUrl && !noMusicPlayer && (
          <>
            <Box mb={2}>
              {/* 埋め込み iframe のコード。幅を 100% にして親コンテナに合わせます */}
              <iframe
                data-testid="embed-iframe"
                src={embedUrl}
                width="100%" // Card の幅に合わせる
                height="152" // 埋め込みプレイヤーの標準的な高さ
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                loading="lazy"
                style={{ borderRadius: '12px' }} // 角丸にする
              />
            </Box>
            <Divider sx={{ mb: 1.5 }} />
          </>
        )}


        {/* 投稿日時 */}
        <Box display="flex" alignItems="center" justifyContent="flex-end" color="text.secondary">
          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption">
            投稿日時: {formattedDate}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};