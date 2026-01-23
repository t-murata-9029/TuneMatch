import { supabase } from "@/lib/supabase.cliant";

/**
 * 自分にLikeしてくれたユーザーをリストで取得します。
 */
export async function getUsersWhoLikedMe() {

    // ログインしてるユーザーのID取得
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw new Error('ユーザーID取得に失敗しました。');
    }

    

}