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

// ----------------------------------------------------
// 1. インターフェース (types.tsからインポートする想定)
// ----------------------------------------------------

// ----------------------------------------------------

interface MusicReviewCardProps {
  review: Music_reviews;
}

/**
 * 1件の音楽レビューを表示するためのコンポーネント
 */
export const MusicReviewCard = ({ review }: MusicReviewCardProps) => {
  // DBから取得した日時文字列 (例: "2025-11-13 01:11:58.763+00") を
  // JavaScriptのDateオブジェクトに変換します。
  // new Date() はこの形式の文字列を自動的に解析できます。
  const dateObject = new Date(review.created_at.toString());

  // Dateオブジェクトを見やすい形式（日本時間）に整形
  const formattedDate = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit', // 秒も表示に追加
  }).format(dateObject);

  return (
    <Card
      sx={{
        maxWidth: 700,
        margin: '16px auto',
        boxShadow: 3,
        border: `1px solid ${colors.grey[200]}`
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          {/* 曲名 */}
          <Box display="flex" alignItems="center">
            <Typography>{review.spotify_tracks?.name}</Typography>
          </Box>
          {/* アーティスト */}
          <Box display="flex" alignItems="center">
            <Typography>{review.spotify_tracks?.spotify_album?.spotify_artists?.name}</Typography>
          </Box>
        </Stack>
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

        {/* 投稿日時 */}
        <Box display="flex" alignItems="center" justifyContent="flex-end" color="text.secondary">
          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption">
            投稿日時: {formattedDate} {/* ★変換した日本時間の日時を表示★ */}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};