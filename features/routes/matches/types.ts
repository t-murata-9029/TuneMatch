import { User } from "@/types/db";

/**
 * おすすめのユーザーを表示するための型
 */
export interface Recommends{
    user: User,
    matchReasons: MatchReasons,
    similarityScore: number,
}