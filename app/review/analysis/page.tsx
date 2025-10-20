'use client';

import { useEffect, useState } from 'react';
import { postReviewState } from '../../types/forms/review';

export default function ReviewAnalysisPage() {
  const [aiText, setAiText] = useState('');

  useEffect(() => {
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

      const data = await res.json();

      const raw = data.text;

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

      console.log(extracted_genres);

      // そのまま JSON として state にセット
      setAiText(extracted_genres + extracted_moods + extracted_keywords);
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
