/**
 * マッチした理由、ユーザー間で近かった項目を取り扱います
 */
interface MatchReasons {
  mostSimilarKeys: string[];
  leastSimilarKeys: string[];
}