import { Swipe_action_type, User } from "@/types/db";
import { Card, CardContent, Box, Avatar, Typography, IconButton } from "@mui/material";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";

// Propsの定義
export interface UserCardProps {
  user: User;
  similarityScore?: number;
  matchReasons?: {
    mostSimilarKeys: string[];
  };
  onLike: (id: string, score?: number) => void;
  onDislike: (id: string, score?: number) => void;
  currentAction?: Swipe_action_type; // 'LIKE' または 'SKIP'
}

/**
 * ユーザーカードコンポーネント
 * 検索結果やレコメンド一覧など、汎用的に利用可能
 */
export const UserCard = ({
  user,
  similarityScore,
  matchReasons,
  onLike,
  onDislike,
  currentAction,
}: UserCardProps) => {
  // 画像URLの生成（supabaseのストレージ構成に依存）
  const avatarUrl = `https://tpwncberbdmckktfcnpg.supabase.co/storage/v1/object/public/user_images/${user.id}/${user.id}`;

  return (
    <Card sx={{ minWidth: 575, maxWidth: 720, mx: "auto", mb: 2,
      borderLeft: currentAction === 'LIKE' ? '6px solid #4caf50' : 
                    currentAction === 'SKIP' ? '6px solid #f44336' : 'none' 
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>

          {/* 左：アバター */}
          <Avatar
            src={avatarUrl}
            alt={user.username}
            sx={{ width: 56, height: 56, flexShrink: 0 }}
          />

          {/* 中央：テキスト情報 */}
          <Box flexGrow={1}>
            <Typography
              variant="h6"
              component="a"
              href={`/user/${user.id}`}
              sx={{ textDecoration: "none", color: "inherit", "&:hover": { textDecoration: "underline" } }}
            >
              {user.username}
            </Typography>

            {/* 類似度スコア：存在する場合のみ表示 */}
            {similarityScore !== undefined && (
              <Typography variant="body1" color="text.secondary">
                類似度: {(similarityScore * 100).toFixed(2)}%
              </Typography>
            )}

            {/* 一致した項目：配列が存在し、中身がある場合のみ表示 */}
            {matchReasons?.mostSimilarKeys && matchReasons.mostSimilarKeys.length > 0 && (
              <Typography variant="body2">
                一致した項目：{matchReasons.mostSimilarKeys[0]}
              </Typography>
            )}

            {/* プロフィール本文：2行で切り捨て */}
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

          {/* 右：アクションボタン */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <Box>
                <IconButton
                  onClick={() => onLike(user.id, similarityScore)}
                  disabled={currentAction === 'LIKE'}
                  sx={{
                    opacity: currentAction === 'SKIP' ? 0.4 : 1,
                  }}
                >
                  <ThumbUpOffAltIcon fontSize="large" />
                </IconButton>

                <IconButton
                  onClick={() => onDislike(user.id, similarityScore)}
                  disabled={currentAction === 'SKIP'}
                  sx={{
                    opacity: currentAction === 'LIKE' ? 0.4 : 1,
                  }}
                >
                  <ThumbDownOffAltIcon fontSize="large" />
                </IconButton>
              </Box>
              {currentAction === 'LIKE' &&
                <Typography variant="caption" fontWeight="bold" color="success.main">いいね済み</Typography>
              }
              {currentAction === 'SKIP' &&
                <Typography variant="caption" fontWeight="bold" color="error.main">スキップ済み</Typography>
              }
            </Box>
          </Box>

        </Box>
      </CardContent>
    </Card >
  );
};