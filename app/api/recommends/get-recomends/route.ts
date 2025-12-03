import { createClient } from "@/lib/supabase.server";
import { NextResponse } from "next/server";

/**
 * このメソッドはAIによる分析の結果をコサイン類似度を使っておすすめの人を探し出します。
 * @param request user_id
 */
export async function GET(request: Request) {

    /** TODO
     * 処理の中身書こうね、
     * マッチ度いくつあったら、リターンするのか不明だから決めようね
     */

    // requestからuserIdを取得
    const { userId } = await request.json();

    // DBからスワイプしてないかつマッチしていないユーザーを取得
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('get_unswiped_users', { current_swiper_id: userId });

    if (error) {
        console.error('DBからユーザー取得に失敗:', error);
        return NextResponse.json({ error: 'ユーザー取得に失敗しました' }, { status: 500 });
    }

    console.log(data);
    // 取得したユーザーと、-自身のマッチ度を計算

    // マッチしたユーザーを返す
}