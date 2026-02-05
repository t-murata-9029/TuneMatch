'use client';

import { useEffect, useState, useRef } from 'react';
import { postReviewState } from '../../../types/forms/review';
import { supabase } from '../../../lib/supabase.cliant';
import { getCurrentUser } from '@/lib/action';
import getToken from '@/utils/spotify/getToken';
import { useSearchParams } from 'next/navigation';
import { Box, Button, CssBaseline, NoSsr, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';
import { RadarChart } from '@mui/x-charts';
import ArtistLink from '@/components/ArtistLink';

async function calculateAverage(user_id: string) {
  try {
    const { data: reviews, error: reviewError } = await supabase
      .from("music_reviews")
      .select("id")
      .eq("user_id", user_id)

    if (reviewError) {
      console.error(reviewError);
      return;
    }

    const reviewIds = reviews.map(r => r.id);

    let totalScore: Record<string, number> = {
      focus_rhythm: 0,
      focus_melody: 0,
      focus_lyric: 0,
      focus_production: 0,
      emotional_intensity: 0,
      sentiment_positivity: 0,
      sentiment_negativity: 0,
      detail_level: 0,
    };

    try {
      for (const reviewId of reviewIds) {
        const { data: rowData, error } = await supabase
          .from("ai_analysis_results")
          .select(
            "focus_rhythm, focus_melody, focus_lyric, focus_production, emotional_intensity, sentiment_positivity, sentiment_negativity, detail_level"
          )
          .eq("review_id", reviewId);

        if (error) {
          console.error("取得エラー:", error);
          continue;
        }

        if (rowData && rowData.length > 0) {
          const rowScore = rowData[0] as Record<string, number>;
          for (const key of Object.keys(rowScore)) {
            totalScore[key] = (totalScore[key] || 0) + rowScore[key];
          }
        }
      }

      console.log("分析数値全権取得結果", totalScore);

      const scoreKeys = Object.keys(totalScore);
      const reviewCount = reviewIds.length;
      let averageScore: Record<string, number> = {};

      for (const key of scoreKeys) {
        averageScore[key] = Math.floor((totalScore[key] / reviewCount) * 100) / 100;;
      }

      console.log("平均値:", averageScore);
      return averageScore;

    } catch (error) {
      console.error("分析数値合計時エラー：", error);
    }
  } catch (error) {
    console.error("レビューid取得時エラー：", error);
  }
}

export default function ReviewAnalysisPage() {

  const router = useRouter();
  const searchParams = useSearchParams();

  const encodedReview = searchParams.get('review');
  const reviewData: postReviewState | null = encodedReview
    ? JSON.parse(decodeURIComponent(atob(encodedReview))) as postReviewState
    : null;

  const encodedData = searchParams.get('data');
  const selectMusic = encodedData
    ? JSON.parse(decodeURIComponent(atob(encodedData)))
    : null;

  const hasRun = useRef(false);
  const [trackData, setTrackData] = React.useState<any | null>(selectMusic);
  const [seriesData, setSeriesData] = useState<any[]>([]);

  console.log('dashbordからの時取得：', selectMusic);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!reviewData) {
      console.error('レビューデータが見つかりません');
      return;
    }

    const prompt = `
    以下の文章を1~8の項目は0.00~1.00の100段階で評価してください。
    9~11の項目は文字列で評価してください
    アーティスト："${selectMusic.artistName}"
    曲："${selectMusic.trackName}"
    文章: "${reviewData.review}"

    1. rhythm: リズム
    2. melody: メロディ
    3. lyric: 歌詞
    4. production: 音作り
    5. intensity: インパクト
    6. sentiment_positivity: ポジティブな感情
    7. sentiment_negativity: ネガティブな感情
    8. detail_level: 詳細度/深掘り度。レビューの文字数や、専門用語、具体的な比喩表現の多さ。音楽を深く掘り下げて語りたい人（詳細度高）と、ライトに楽しみたい人（詳細度低）の傾向を分析。
    9. extracted_genres: レビュー内で言及されたジャンルやサブジャンル、共通のニッチなジャンル
    10.extracted_moods: レビューから読み取れるムードや雰囲気、音楽に求めるシーンや用途
    11.extracted_keywords: その他の重要な特徴キーワード、具体的な音楽の嗜好

    9〜11は、必ず string の配列(string[])で返してください。
    単一の要素であっても、配列にしてください。
    例： ["疾走感"] ← OK / "疾走感" ← NG
    空の場合も空配列にしてください。[] ← OK / null ← NG
    出力は JSON のみで。余計な装飾はなし。

    出力形式:
    json
      {
  "rhythm": 数値,
  "melody": 数値,
  "lyric": 数値,
  "production": 数値,
  "intensity": 数値,
  "sentiment_positivity": 数値,
  "sentiment_negativity": 数値,
  "detail_level": 数値,
  "extracted_genres": ['文字列'],
  "extracted_moods": [
    '文字列'
  ],
  "extracted_keywords": [
    '文字列'
  ]
}
    `

    async function callApi() {

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });

      const gemini_data = await res.json();

      console.log("res", res);
      console.log(gemini_data);

      const raw = gemini_data.text;
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      const focus_rhythm = parsed.rhythm;
      const focus_melody = parsed.melody;
      const focus_lyric = parsed.lyric;
      const focus_production = parsed.production;
      const emotional_intensity = parsed.intensity;
      const sentiment_positivity = parsed.sentiment_positivity;
      const sentiment_negativity = parsed.sentiment_negativity;
      const detail_level = parsed.detail_level;
      const extracted_genres = parsed.extracted_genres;
      const extracted_moods = parsed.extracted_moods;
      const extracted_keywords = parsed.extracted_keywords;

      const reviewRederData = [
        focus_rhythm,
        focus_melody,
        focus_lyric,
        focus_production,
        emotional_intensity,
        sentiment_positivity,
        sentiment_negativity
      ];

      const newSeriesData = [{
        data: reviewRederData,
        color: '#FF69B4',
        fillOpacity: 0.6,
        area: true
      }];

      setSeriesData(newSeriesData);

      let reviewId;

      const userData = await getCurrentUser();

      if (userData == null) {
        return
      }

      const user_id = userData.id;

      //アーティスト登録されているかチェック
      let artistResult = false;

      try {
        const { data } = await supabase
          .from('spotify_artists')
          .select('id')
          .eq('id', selectMusic.artistId);

        artistResult = (data?.length ?? 0) > 0;
      } catch (err) {
        console.error('アーティスト取得エラー:', err);
      }

      if (!artistResult) {
        const spotify_access_token = await getToken();
        const url = `https://api.spotify.com/v1/artists/${selectMusic.artistId}`;

        const result = await fetch(url, {
          headers: { Authorization: `Bearer ${spotify_access_token}` }
        });

        const resultJson = await result.json();
        const artistImageUrl: string | undefined = resultJson.images[1]?.url ?? '';
        const genres: string[] = resultJson.genres;

        try {
          await supabase
            .from('spotify_artists')
            .insert([
              {
                id: selectMusic.artistId,
                name: selectMusic.artistName,
                image_url: artistImageUrl,
                genres: genres
              }
            ])
        } catch (err) {
          console.error('アーティスト登録時エラー：', err);
        }
      }

      //album登録されているかチェック
      let albumResult = false;

      try {
        const { data } = await supabase
          .from('spotify_album')
          .select('id')
          .eq('id', selectMusic.albumId);

        albumResult = (data?.length ?? 0) > 0;
      } catch (err) {
        console.error('アルバム取得エラー:', err);
      }

      if (!albumResult) {
        try {
          await supabase
            .from('spotify_album')
            .insert([
              {
                id: selectMusic.albumId,
                name: selectMusic.albumName,
                image_url: selectMusic.albumImage,
                release_date: selectMusic.albumReleaseDate,
                total_tracks: selectMusic.albumTotalTracks,
                artist_id: selectMusic.artistId
              }
            ])
        } catch (err) {
          console.error('アルバム登録時エラー：', err);
        }
      }

      //tracks登録されているかチェック
      let tracksResult = false;

      try {
        const { data } = await supabase
          .from('spotify_tracks')
          .select('id')
          .eq('id', selectMusic.trackId);

        tracksResult = (data?.length ?? 0) > 0;
      } catch (err) {
        console.error('トラック取得エラー:', err);
      }

      if (!tracksResult) {
        try {
          await supabase
            .from('spotify_tracks')
            .insert([
              {
                id: selectMusic.trackId,
                album_id: selectMusic.albumId,
                name: selectMusic.trackName,
                track_number: selectMusic.trackNumber,
                duration_ms: selectMusic.durationMs,
              }
            ])
        } catch (err) {
          console.error('トラック登録時エラー：', err);
        }
      }

      //music_reviews登録
      try {
        const { data: responseData, error } = await supabase
          .from('music_reviews')
          .insert([
            {
              user_id: user_id,
              track_id: selectMusic.trackId,
              review_text: reviewData?.review,
              rating: reviewData?.rating,
              created_at: new Date().toISOString()
            }
          ])
          .select();
        if (error) console.error('Supabase insert error music_reviews', error);
        else console.log(responseData);
        reviewId = responseData![0].id;
      } catch (err) {
        console.error('Supabase insert failed music_reviews', err);
      }

      // レビュー分析された数値の登録
      try {
        const { data: responseData, error } = await supabase
          .from('ai_analysis_results')
          .insert([
            {
              review_id: reviewId,
              focus_rhythm: focus_rhythm,
              focus_melody: focus_melody,
              focus_lyric: focus_lyric,
              focus_production: focus_production,
              emotional_intensity: emotional_intensity,
              sentiment_positivity: sentiment_positivity,
              sentiment_negativity: sentiment_negativity,
              detail_level: detail_level,
              extracted_genres: extracted_genres,
              extracted_moods: extracted_moods,
              extracted_keywords: extracted_keywords,
              analysis_at: new Date().toISOString()
            }
          ])
          .select();

        if (error) console.error('Supabase insert error ai_analysis', error);
        else console.log(responseData);
      } catch (err) {
        console.error('Supabase insert failed ai_analysis', err);
      }

      // usersテーブル数値登録されてるかチェック
      let zeroFlags;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user_id)
          .single()

        const scoreKeys = [
          "ai_vibe_score_rhythm",
          "ai_vibe_score_melody",
          "ai_vibe_score_lyric",
          "ai_vibe_score_production",
          "ai_vibe_score_emotional_intensity",
          "ai_vibe_score_positivity",
          "ai_vibe_score_negativity",
          "ai_vibe_score_detail_level"
        ] as const

        zeroFlags = Object.fromEntries(
          scoreKeys.map((key) => [
            key,
            Number(data[key]) === 0
          ])
        )

      } catch (err) {
        console.error("usersテーブル数値取得時エラー：", err);
      }

      const allZero = Object.values(zeroFlags ?? {}).every(Boolean);

      console.log(allZero);

      let averageScore;

      if (!allZero) {
        averageScore = await calculateAverage(user_id);
      } else {
        averageScore = {
          focus_rhythm,
          focus_melody,
          focus_lyric,
          focus_production,
          emotional_intensity,
          sentiment_positivity,
          sentiment_negativity,
          detail_level
        };
      }

      // usersテーブル分析数値項目更新
      try {
        const { data, error } = await supabase
          .from("users")
          .update({
            ai_vibe_score_rhythm: averageScore?.focus_rhythm,
            ai_vibe_score_melody: averageScore?.focus_melody,
            ai_vibe_score_lyric: averageScore?.focus_lyric,
            ai_vibe_score_production: averageScore?.focus_production,
            ai_vibe_score_emotional_intensity: averageScore?.emotional_intensity,
            ai_vibe_score_positivity: averageScore?.sentiment_positivity,
            ai_vibe_score_negativity: averageScore?.sentiment_negativity,
            ai_vibe_score_detail_level: averageScore?.detail_level,
          })
          .eq("id", user_id);

        if (error) {
          console.error("スコアUPDATEエラー:", error);
        } else {
          console.log("UPDATE成功:", data);
        }
      } catch (error) {
        console.error("usersテーブルupdate時エラー：", error);
      }
    }

    callApi();
  }, [reviewData]);

  const handleSubmit = () => {
    router.push('../../dashboard');
  };

  return (
    <NoSsr>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 3,
          bgcolor: '#fafafa',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 'bold', }}>
          {'あなたのレビュー結果'}
        </Typography>

        {seriesData.length > 0 && (
          <Box sx={{
            width: '100%',
            maxWidth: 700,
            display: 'flex',
            justifyContent: 'center',
            bgcolor: '#fff',
            borderRadius: 3,
            p: 4,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            mb: 5
          }}>
            <RadarChart
              width={650}
              height={600}
              margin={{ top: 50, right: 100, left: 100, bottom: 50 }}
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
          </Box>
        )}

        {/* レビュー内容セクション */}
        {reviewData && (
          <Box sx={{
            width: '100%',
            maxWidth: 700,
            mb: 5,
            bgcolor: '#fff',
            borderRadius: 3,
            p: 3,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '2px solid #FF69B4'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#FF69B4', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                📝 あなたのレビュー
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                ⭐{reviewData.rating}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.6 }}>
              {reviewData.review}
            </Typography>
          </Box>
        )}

      <Button
        variant="contained"
        onClick={handleSubmit}
        sx={{
          width: 'auto',
          px: 6,
          py: 1.8,
          fontSize: '1rem',
          fontWeight: 'bold',
          textTransform: 'none',
          borderRadius: 2
        }}
      >
        ダッシュボードへ
      </Button>
    </Box>
    </NoSsr >
  );
}