// types/db.ts などに定義されている前提
export interface VibeScoreVector {
  detail: number;
  emotional: number;
  lyric: number;
  melody: number;
  negativity: number;
  positivity: number;
  production: number;
  rhythm: number;
}

// 関数の戻り値の型
interface MatchReasons {
  mostSimilarKeys: string[];
  leastSimilarKeys: string[];
}

/**
 * 2つのVibeScoreVectorを比較し、最も似ている項目（差が小さい）と
 * 最も似ていない項目（差が大きい）を特定します。
 * @param scoresA ユーザーAのVibeScoreVector
 * @param scoresB ユーザーBのVibeScoreVector
 * @param topN 上位/下位何項目を抽出するか (デフォルト: 3)
 * @returns 類似/非類似の項目キーのリスト
 */
export const findSimilarVibeScores = (
  scoresA: VibeScoreVector,
  scoresB: VibeScoreVector,
  topN: number = 3
): MatchReasons => {
  
  const scoreDifferences: { key: keyof VibeScoreVector; diff: number }[] = [];
  
  // VibeScoreVectorのキーリスト
  const keys: Array<keyof VibeScoreVector> = [
    'detail', 'emotional', 'lyric', 'melody', 'negativity', 'positivity', 'production', 'rhythm'
  ];

  for (const key of keys) {
    // スコアの絶対差を計算
    const diff = Math.abs(scoresA[key] - scoresB[key]);
    scoreDifferences.push({ key, diff });
  }

  // 1. 差が小さい順（似ている項目）にソート
  scoreDifferences.sort((a, b) => a.diff - b.diff);
  const mostSimilarKeys = scoreDifferences.slice(0, topN).map(d => d.key);

  // 2. 差が大きい順（似ていない項目）にソート (再ソート)
  // すでにソートされているので、末尾から取得する方法もありますが、可読性のため再度差が大きい順にソートします
  scoreDifferences.sort((a, b) => b.diff - a.diff);
  const leastSimilarKeys = scoreDifferences.slice(0, topN).map(d => d.key);

  return {
    mostSimilarKeys: mostSimilarKeys as string[], // string[]にキャストして返す
    leastSimilarKeys: leastSimilarKeys as string[],
  };
};