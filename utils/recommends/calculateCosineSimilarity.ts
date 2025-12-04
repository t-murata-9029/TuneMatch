/**
 * 2つのベクトル間のコサイン類似度を計算します。
 * @param vecA ユーザーAのvibe scoreベクトル
 * @param vecB ユーザーBのvibe scoreベクトル
 * @returns コサイン類似度 (0.0 から 1.0)
 */
const calculateCosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same dimension.");
  }

  let dotProduct = 0; // 内積
  let normA = 0;      // ベクトルAのノルム^2
  let normB = 0;      // ベクトルBのノルム^2

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  // ゼロ除算を避ける
  if (normA === 0 || normB === 0) {
    return 0;
  }

  // コサイン類似度の計算: (内積) / (||A|| * ||B||)
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export default calculateCosineSimilarity;