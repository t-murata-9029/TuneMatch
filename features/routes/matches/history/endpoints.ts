import { supabase } from "@/lib/supabase.cliant";
import { Swipe_actions_user } from "../liked/type";


/**
 * ログインしているユーザーのスワイプアクション履歴を取得します。
 */
export async function getSwipeActionsHistory() :Promise<Swipe_actions_user[]> {

    // ログインしてるユーザーのID取得
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error(userError);
        throw new Error('ユーザーID取得に失敗しました。');
    }

    const userId = userData.user?.id;

    // 自分がスワイプした人と、そのユーザーの詳細情報を取得
    const { data: historyData, error: historyError } = await supabase
        .from("swipe_actions")
        .select(`
    *,
    swiped:swiped_id (
      id,
      username,
      profile_text,
      gender
    )
  `)
        .eq('swiper_id', userId); // 自分のIDが「スワイプされた側」のデータ

    if (historyError) {
        console.error(historyError);
        throw new Error('スワイプアクション履歴の取得に失敗しました。');
    }

    const historyList = historyData as Swipe_actions_user[];

    return historyList
}