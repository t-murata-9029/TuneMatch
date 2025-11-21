'use client';

import { useEffect, useState, useRef } from 'react';
import { postReviewState } from '../../../types/forms/review';
import { supabase } from '../../../lib/supabase.cliant';
import { getCurrentUser } from '@/lib/action';
import getToken from '@/utils/spotify/getToken';
import { constants } from 'buffer';
import { Box, Button, createTheme, CssBaseline, NoSsr, ThemeProvider, Typography, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';

//表示するデータ用
interface aaa {
  rhythm?: number,
  melody?: number,
  lyric?: number,
  sentiment_positivity?: number,
  sentiment_negativity?: number,
}

export default function ReviewAnalysisPage() {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // 🔹 テーマ
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: { mode: prefersDarkMode ? 'dark' : 'light' },
        components: {
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: prefersDarkMode ? '#ffffff' : '#000000',
                  borderWidth: 2,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: prefersDarkMode ? '#64b5f6' : '#42a5f5',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: prefersDarkMode ? '#2196f3' : '#1565c0',
                },
              },
            },
          },
        },
      }),
    [prefersDarkMode]
  );

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
      const rhythm = parsed["1"];
      const melody = parsed["2"];
      const lyric = parsed["3"];
      const production = parsed["4"];
      const intensity = parsed["5"];
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

        artistResult = (count ?? 0) > 0;
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

        artistResult = (count ?? 0) > 0;
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

      try {

        const { data: responseData, error } = await supabase
          .from('ai_analysis_results')
          .insert([
            {
              review_id: reviewId,
              focus_rhythm: rhythm,
              focus_melody: melody,
              focus_lyric: lyric,
              focus_production: production,
              emotional_intensity: intensity,
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
      const reviewData2: aaa = {
        rhythm,
        melody,
        lyric,
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
      <ThemeProvider theme={theme}>
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
            <Typography> 歌詞：{reviewResult?.lyric}</Typography>
            <Typography> メロディー：{reviewResult?.melody}</Typography>
            <Typography> リズム：{reviewResult?.rhythm}</Typography>
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
      </ThemeProvider>
    </NoSsr>

  );
}
