import { supabase } from "@/lib/supabase.cliant";

/**
 * 自分にLikeしてくれたユーザーをリストで取得します。
 */
export async function getUsersWhoLikedMe() {

    // ログインしてるユーザーのID取得
    const { data: userData, error:userError } = await supabase.auth.getUser();

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

}