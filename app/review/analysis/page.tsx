'use client';

import { useEffect, useState, useRef } from 'react';
import { postReviewState } from '../../types/forms/review';
import { supabase } from '../../../lib/supabase.cliant';

export default function ReviewAnalysisPage() {
  const [aiText, setAiText] = useState('');
  const hasRun = useRef(false);

  useEffect(() => {

    if (hasRun.current) return;
    hasRun.current = true;

    const reviewStr = sessionStorage.getItem('reviewData');
    if (!reviewStr) return;

    const reviewData: postReviewState = JSON.parse(reviewStr);

    const prompt = `
    以下の文章を1~8の項目は0.00~1.00の100段階で評価してください。
    9~11の項目は文字列で評価してください
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

    出力は JSON のみで。余計な装飾はなし。
    
    `

    async function callApi() {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });

      const gemini_data = await res.json();

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

      try {

        const { data: responseData, error } = await supabase
          .from('music_reviews')
          .insert([
            {
              user_id: '607ecfc1-ec3e-4977-b467-efc7d0a5b1f8',
              track_id: '0udpslNSUIbvaTujS5TL5p',
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
      // そのまま JSON として state にセット
      setAiText('むーり');
    }

    callApi();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>受け取り画面</h1>
      <pre>{aiText}</pre>
    </div>
  );
}
