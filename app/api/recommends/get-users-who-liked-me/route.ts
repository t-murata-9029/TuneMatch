import { createClient } from "@/lib/supabase.server";

/**
 * Likeしてくれた人を返すよ。
 * @param request 
 */
export async function GET(request: Request) {

    // requestからuserIdを取得
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');


    const supabase = await createClient();

    // DBからuserIdに対していいねした人を取得
    const { data, error } = await supabase
        .from("swipe_action")
        .select(`
            action_at,
            swiper_id,
            users:swiper_id (*)
        `)
        .eq("swiped_id", userId)         // 「スワイプされた人」が自分
        .eq("action_type", "like")      // アクションが「いいね」
        .order("action_at", { ascending: false }); // 新しい順

    
}