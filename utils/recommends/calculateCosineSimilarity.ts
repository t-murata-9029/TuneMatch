import { VibeScoreVector } from "@/types/db";

/**
 * 2つのVibeScoreVector間のコサイン類似度を計算します。
 * 8つのスコア項目を反復処理し、内積とノルムを求めます。
 * * @param vecA ユーザーAのVibeScoreVector
 * @param vecB ユーザーBのVibeScoreVector
 * @returns コサイン類似度 (0.0 から 1.0)
 */
export const calculateCosineSimilarityFromVector = (
  vecA: VibeScoreVector, 
  vecB: VibeScoreVector
): number => {
  
  let dotProduct = 0; // 内積 (A・B)
  let normA = 0;      // ベクトルAのノルム^2 (||A||^2)
  let normB = 0;      // ベクトルBのノルム^2 (||B||^2)

  // VibeScoreVectorのキーリストを取得
  const keys: Array<keyof VibeScoreVector> = [
    'detail', 'emotional', 'lyric', 'melody', 'negativity', 'positivity', 'production', 'rhythm'
  ];

  for (const key of keys) {
    const a = vecA[key];
    const b = vecB[key];

    // 内積を計算
    dotProduct += a * b;
    
    // ノルムの二乗を計算
    normA += a * a;
    normB += b * b;
  }

  // ノルムがゼロ（すべてのスコアが0）のベクトルがある場合は、類似度を0とします
  if (normA === 0 || normB === 0) {
    return 0;
  }

  // コサイン類似度の計算: (A・B) / (||A|| * ||B||)
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};