import { supabase } from "@/lib/supabase.cliant";
import { Swipe_action_type } from "@/types/db";
import { Swipe_actions_user } from "./type";

/**
 * 自分にLikeしてくれたユーザーをリストで取得します。
 */
export async function getUsersWhoLikedMe():Promise<Swipe_actions_user[]> {

    // ログインしてるユーザーのID取得
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
        throw new Error('ユーザーID取得に失敗しました。');
    }

    const userId = userData.user?.id

    // 自分にいいねした人と、そのユーザーの詳細情報を取得
    const { data: likeData, error: likeError } = await supabase
        .from("swipe_actions")
        .select(`
    *,
    swiper:swiper_id (
      id,
      username,
      profile_text,
      gender
    )
  `)
        .eq('swiped_id', userId) // 自分のIDが「スワイプされた側」のデータ
        .eq('action_type', 'LIKE');     // 「いいね」だけに絞り込む場合
    
    const UserList = likeData as Swipe_actions_user[];

    return UserList
}