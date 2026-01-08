// PostPage.tsx (修正案)

import { MusicReviewCard } from "@/components/MusicReviewCard";
import { MusicReviewList } from "@/components/MusicReviewList";
import { getCurrentUser } from "@/lib/action";
import { supabase } from "@/lib/supabase.cliant";
import { Music_reviews, User } from "@/types/db";
import { getReviewByUserId } from "@/utils/supabase/getReviews";
import { Box, Divider, Link, Paper, Typography, Stack, colors, Grid, Avatar } from "@mui/material";

// アイコンのインポート (MUI Iconsから適切なものを選択)
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { RadarChart } from "@mui/x-charts";

export default async function PostPage({
  params,
}: {
  params: Promise<{ user_id: string }>
}) {
  // URLからuser_idを取得
  const { user_id } = await params;


  // DBからユーザーの情報を取得
  const { data, error } = await supabase.from("users").select("*").eq("id", user_id).single()
  if (error || !data) {
    console.error("DBのアクセスに失敗しました。")
    // エラー時は適切なUIを返す
    return <Typography color="error">ユーザー情報の取得に失敗しました。</Typography>
  }
  const user: User = data as User;

  // レーダーチャートで自分の情報表示するために取得
  const currentUser = await getCurrentUser();
  const currentUserId = currentUser?.id;
  const { data: currentUserData, error: currentUserError } = await supabase.from("users").select("*").eq("id", currentUserId).single();


  // マイページかどうかの判定
  const isMypage = currentUserId === user_id;

  // レーダーチャート用データ整形

  const targetUserData = [
    user.ai_vibe_score_rhythm || 0,
    user.ai_vibe_score_melody || 0,
    user.ai_vibe_score_lyric || 0,
    user.ai_vibe_score_production || 0,
    user.ai_vibe_score_emotion || 0,
    user.ai_vibe_score_positivity || 0,
    user.ai_vibe_score_negativity || 0,
  ];

  const currentData = currentUser ? [
    currentUserData.ai_vibe_score_rhythm || 0,
    currentUserData.ai_vibe_score_melody || 0,
    currentUserData.ai_vibe_score_lyric || 0,
    currentUserData.ai_vibe_score_production || 0,
    currentUserData.ai_vibe_score_emotion || 0,
    currentUserData.ai_vibe_score_positivity || 0,
    currentUserData.ai_vibe_score_negativity || 0,
  ] : [];

  let seriesData: any[] = [];

  seriesData.push({
    label: "あなた",
    data: currentData, // 対象ユーザーのデータ
    color: '#FF69B4',
    fillOpacity: 0.6,
    area: true,
  });

  if (!isMypage) {
    seriesData.push({
      label: user.username,
      data: targetUserData,
      color: '#FF7F50',
      fillOpacity: 0.6,
      area: true,
    });

  }

  if (currentUserError || !currentUserData) {
    console.error("DBのアクセスに失敗しました。")
  }

  // 性別を取得、色を変更
  let color: string = colors.grey[800]; // デフォルト
  let genderLabel = "不明";
  if (user.gender == 'FEMALE') {
    color = colors.pink[500];
    genderLabel = "女性";
  } else if (user.gender == 'MALE') {
    color = colors.blue[500];
    genderLabel = "男性";
  } else {
    color = colors.green[500];
    genderLabel = "その他";
  }

  // レビューを取得
  const reviews: Music_reviews[] = await getReviewByUserId(user_id);

  return (
    <Box sx={{ p: 3, maxWidth: 900, margin: '0 auto' }}>

      {/* 1. プロフィールセクション (Paperで囲んで視覚的にまとめる) */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>

        {/* ユーザー名と性別 */}
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <Avatar sx={{ fontSize: 40, color: color }} src={"https://tpwncberbdmckktfcnpg.supabase.co/storage/v1/object/public/user_images/" + user_id + "/" + user_id} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            <Box component="span" color={color}>
              {user.username}
            </Box>
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            ({genderLabel})
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* プロフィールテキスト */}
        <Typography variant="h6" gutterBottom>
          自己紹介
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3, minHeight: 40 }}>
          {user.profile_text || "まだ自己紹介文がありません。"}
        </Typography>

        {/* プロフィール画像アップロードリンク (マイページのみ) */}
        {isMypage && (
          <Link href={'#'} variant="body2" display="block" sx={{ textAlign: 'right', mb: 2 }}>
            プロフィール画像をアップロードする
          </Link>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* AI Vibe Score (Gridで整理) */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          AIミュージックスコア
        </Typography>

        <RadarChart
          height={300}
          series={seriesData}
          radar={{
            metrics: [
              { name: 'リズム', max: 1 },
              { name: 'メロディ', max: 1 },
              { name: 'リリック', max: 1 },
              { name: 'プロダクション', max: 1 },
              { name: 'エモーション', max: 1 },
              { name: 'ポジティブ', max: 1 },
              { name: 'ネガティブ', max: 1 },
            ]
          }}
        />
      </Paper>
      {/* 2. レビューリストセクション */}
      <Typography variant="h5" component="h2" sx={{ mb: 3, mt: 4, textAlign: 'center' }}>
        {user.username} さんの投稿したレビュー
      </Typography>

      <Box id="review_list">
        {
          reviews.length !== 0 ?
            // MusicReviewListにレビューを渡して表示
            <MusicReviewList reviews={reviews} />
            : <Typography sx={{ textAlign: 'center', p: 3 }}>レビューを投稿していないようです。</Typography>
        }
      </Box>

    </Box>
  );
}