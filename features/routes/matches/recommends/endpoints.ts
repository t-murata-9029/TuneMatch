import { supabase } from "@/lib/supabase.cliant"
import { Recommends } from "./types";

/**
 * おすすめのユーザーリストを取得します。
 */
export async function getRecommendsList() {

    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw new Error('ユーザーID取得に失敗しました。');
    }

    const userId = data.user?.id

    const response = await fetch(`/api/recommends/get-recommends?userId=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    // JSONを取り出す
    const json = await response.json();

    const results = json["results"] as Recommends[];

    return results;
}