'use client';

import { useEffect, useState, useRef } from 'react';
import { postReviewState } from '../../../types/forms/review';
import { supabase } from '../../../lib/supabase.cliant';
import { getCurrentUser } from '@/lib/action';
import getToken from '@/utils/spotify/getToken';
import { constants } from 'buffer';
import { Box, Button, createTheme, CssBaseline, NoSsr, Typography, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';
import { userAgent } from 'next/server';

//表示するデータ用
interface aaa {
  focus_rhythm?: number,
  focus_melody?: number,
  focus_lyric?: number,
  sentiment_positivity?: number,
  sentiment_negativity?: number,
}

async function calculateAverage(user_id: string) {

  // 各数値化項目全権取得
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
      // reviewId をぶん回す場合の例
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

        // rowData は配列で返る
        if (rowData && rowData.length > 0) {

          const rowScore = rowData[0] as Record<string, number>;

          // 合計計算（string index のエラーはもう出ない）
          for (const key of Object.keys(rowScore)) {
            totalScore[key] = (totalScore[key] || 0) + rowScore[key];
          }
        }
      }

      console.log("分析数値全権取得結果", totalScore);

      const scoreKeys = Object.keys(totalScore); // ← これでOK

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

  const hasRun = useRef(false);

  const [reviewResult, setReviewResult] = useState<aaa>();

  const dataJson = sessionStorage.getItem('selectedItem');
  const selectMusic = dataJson ? JSON.parse(dataJson) : null;

  useEffect(() => {

    if (hasRun.current) return;
    hasRun.current = true;

    const reviewStr = sessionStorage.getItem('reviewData');
    if (!reviewStr) return;

    const reviewData: postReviewState = JSON.parse(reviewStr);

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
    
    `

    async function callApi() {

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });

      const gemini_data = await res.json();

      console.log("res", res);

      const raw = gemini_data.text;

      // 「```json」と「```」を除去
      const clean = raw.replace(/```json|```/g, '').trim();

      // JSON としてパース
      const parsed = JSON.parse(clean);

      // こうすればOK
      const focus_rhythm = parsed["1"];
      const focus_melody = parsed["2"];
      const focus_lyric = parsed["3"];
      const focus_production = parsed["4"];
      const emotional_intensity = parsed["5"];
      const sentiment_positivity = parsed["6"];
      const sentiment_negativity = parsed["7"];
      const detail_level = parsed["8"];
      const extracted_genres = parsed["9"];
      const extracted_moods = parsed["10"];
      const extracted_keywords = parsed["11"];

      let reviewId;

      // userData取得
      const userData = await getCurrentUser();

      if (userData == null) {
        return
      }

      const user_id = userData.id;

      //アーティスト登録されているかチェック////////////////////////////////
      let artistResult = false;

      try {
        const { count } = await supabase
          .from('spotify_artists')
          .select('*', { count: 'exact', head: true })
          .eq('id', selectMusic.artistId)
          .single();

        artistResult = (count ?? 0) > 0;
      } catch (err) {
        console.error('アーティスト取得エラー:', err);
      }

      //アーティスト登録されていなかった場合
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
      ///////////////////////////////////////////////////////////////////

      //album登録されているかチェック//////////////////////////////////////

      let albumResult = false;

      try {
        const { count } = await supabase
          .from('spotify_album')
          .select('*', { count: 'exact', head: true })
          .eq('id', selectMusic.albumId)
          .single();

        albumResult = (count ?? 0) > 0;
      } catch (err) {
        console.error('アルバム取得エラー:', err);
      }

      //アルバム登録されていなかった場合
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
      ///////////////////////////////////////////////////////////////////

      //tracks登録されているかチェック//////////////////////////////////////

      let tracksResult = false;

      try {
        const { count } = await supabase
          .from('spotify_tracks')
          .select('*', { count: 'exact', head: true })
          .eq('id', selectMusic.trackId)
          .single();

        tracksResult = (count ?? 0) > 0;
      } catch (err) {
        console.error('トラック取得エラー:', err);
      }

      //トラック登録されていなかった場合
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
      ///////////////////////////////////////////////////////////////////

      //music_reviews登録
      try {

        const { data: responseData, error } = await supabase
          .from('music_reviews')
          .insert([
            {
              user_id: user_id,
              track_id: selectMusic.trackId,
              review_text: reviewData.review,
              rating: reviewData.rating,
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

        // true/false フラグ生成
        zeroFlags = Object.fromEntries(
          scoreKeys.map((key) => [
            key,
            Number(data[key]) === 0 // 0.00にも対応
          ])
        )

      } catch (err) {
        console.error("usersテーブル数値取得時エラー：", err);
      }

      const allZero = Object.values(zeroFlags ?? {}).every(Boolean);

      console.log(allZero);

      let averageScore;

      // usersテーブル項目に数値が登録されていた場合
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
          .eq("id", user_id); // ← 更新対象

        if (error) {
          console.error("スコアUPDATEエラー:", error);
        } else {
          console.log("UPDATE成功:", data);
        }

      } catch (error) {
        console.error("usersテーブルupdate時エラー：", error);
      }

      // ここから下のコード仮で表示など
      const reviewData2: aaa = {
        focus_rhythm,
        focus_melody,
        focus_lyric,
        sentiment_positivity,
        sentiment_negativity,
      }


      sessionStorage.removeItem("selectedItem");
      sessionStorage.removeItem("reviewData");
      sessionStorage.removeItem("queryData");
      sessionStorage.removeItem("selectedAlbum");
      sessionStorage.removeItem("selectedArtist");


      setReviewResult(reviewData2);
    }

    callApi();
  }, []);

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
          p: 2,
        }}
      >
        <div style={{ padding: 20 }}>
          <h1>受け取り画面</h1>
          <Typography> 歌詞：{reviewResult?.focus_lyric}</Typography>
          <Typography> メロディー：{reviewResult?.focus_melody}</Typography>
          <Typography> リズム：{reviewResult?.focus_rhythm}</Typography>
          <Typography> ポジティブ：{reviewResult?.sentiment_positivity}</Typography>
          <Typography> ネガティブ：{reviewResult?.sentiment_negativity}</Typography>
        </div>

        <Button
          variant="outlined"
          onClick={handleSubmit}
          sx={{ width: 'auto', px: 3, py: 1.5 }}
        >
          ダッシュボード
        </Button>
      </Box>
    </NoSsr>

  );
}
