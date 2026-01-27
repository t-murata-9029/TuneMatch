import { User } from "@/types/db";


// Propsの定義
export interface UserCardProps {
  user: User;
  similarityScore?: number; // 類似度も出さない場合があるならオプショナルに
  matchReasons?: {
    mostSimilarKeys: string[];
  };
  onLike: (id: string, score?: number) => void;
  onDislike: (id: string) => void;
}

import { Card, CardContent, Box, Avatar, Typography, IconButton } from "@mui/material";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";

/**
 * ユーザーカードコンポーネント
 * LIKEとSKIPのボタン付き
 * @param user ユーザー情報
 * @param similarityScore 類似度スコア
 * @param matchReasons 一致した項目の理由
 * @param onLike LIKEボタンクリック時の処理
 * @param onDislike SKIPボタンクリック時の処理
 */
export const UserCard = ({ 
  user, 
  similarityScore, 
  matchReasons, 
  onLike, 
  onDislike 
}: UserCardProps) => {
  return (
    <Card sx={{ minWidth: 575, maxWidth: 720, mx: "auto", mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          {/* 左：アバター */}
          <Avatar
            src={`https://tpwncberbdmckktfcnpg.supabase.co/storage/v1/object/public/user_images/${user.id}/${user.id}`}
            alt={user.username}
            sx={{ width: 56, height: 56, flexShrink: 0 }}
          />

          {/* 中央：テキスト */}
          <Box flexGrow={1}>
            <Typography variant="h6" component="a" href={`/user/${user.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
              {user.username}
            </Typography>

            {/* 類似度がある場合のみ表示 */}
            {similarityScore !== undefined && (
              <Typography variant="body1" color="text.secondary">
                類似度: {(similarityScore * 100).toFixed(2)}%
              </Typography>
            )}

            {/* 一致した項目がある場合のみ表示 */}
            {matchReasons?.mostSimilarKeys?.[0] && (
              <Typography variant="body2">
                一致した項目：{matchReasons.mostSimilarKeys[0]}
              </Typography>
            )}

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {user.profile_text}
            </Typography>
          </Box>

          {/* 右：アクション */}
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton color="success" onClick={() => onLike(user.id, similarityScore)}>
              <ThumbUpOffAltIcon fontSize="large" />
            </IconButton>
            <IconButton color="error" onClick={() => onDislike(user.id)}>
              <ThumbDownOffAltIcon fontSize="large" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};