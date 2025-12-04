import { createClient } from "@/lib/supabase.server";
import { User } from "@/types/db";
import calculateCosineSimilarity from "@/utils/recommends/calculateCosineSimilarity";
import { NextResponse } from "next/server";

/**
 * このメソッドはAIによる分析の結果をコサイン類似度を使っておすすめの人を探し出します。
 * @param request user_id
 */
export async function GET(request: Request) {

    /** TODO
     * なんでマッチしたか、わからないから、わかるようにする。
     * https://gemini.google.com/share/8685fd630788
     */

    // requestからuserIdを取得
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // DBからスワイプしてないかつマッチしていないユーザーを取得
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('get_unswiped_users', { current_swiper_id: userId });

    if (error) {
        console.error('DBからユーザー取得に失敗:', error);
        return NextResponse.json({ error: 'ユーザー取得に失敗しました' }, { status: 500 });
    }

    // 取得した結果を使いやすいように変換
    const userList = data as User[];

    // 取得したユーザーから、自身の情報を取得
    const targetUser = userList.find(u => u.id === userId);
    if (!targetUser) {
        return NextResponse.json({ message: "Target user not found" }, { status: 404 });
    }

    // ターゲットユーザーのベクトルを生成
    const targetVector = [
        targetUser.ai_vibe_score_detail_score || 0,
        targetUser.ai_vibe_score_emotion || 0,
        targetUser.ai_vibe_score_lyric || 0,
        targetUser.ai_vibe_score_melody || 0,
        targetUser.ai_vibe_score_negativity || 0,
        targetUser.ai_vibe_score_positivity || 0,
        targetUser.ai_vibe_score_production || 0,
        targetUser.ai_vibe_score_rhythm || 0
    ];

    const similarityResults = [];

    // 取得したユーザーと、自身のマッチ度を計算
    for (const otherUser of userList) {
        // 自身との比較はスキップ
        if (otherUser.id === userId) {
            continue;
        }

        // 他のユーザーのベクトルを生成
        const otherVector = [
            otherUser.ai_vibe_score_detail_score || 0,
            otherUser.ai_vibe_score_emotion || 0,
            otherUser.ai_vibe_score_lyric || 0,
            otherUser.ai_vibe_score_melody || 0,
            otherUser.ai_vibe_score_negativity || 0,
            otherUser.ai_vibe_score_positivity || 0,
            otherUser.ai_vibe_score_production || 0,
            otherUser.ai_vibe_score_rhythm || 0
        ];

        // コサイン類似度を計算
        const similarity = calculateCosineSimilarity(targetVector, otherVector);

        similarityResults.push({
            userId: otherUser.id,
            similarityScore: parseFloat(similarity.toFixed(4)), // 小数点以下4桁に丸める
        });
    }

    // 類似度の高い順にソート
    similarityResults.sort((a, b) => b.similarityScore - a.similarityScore);

    // 返還用の変数
    const resultList: User[] = [];

    // ソートした順番通りに、ユーザーを入れる
    similarityResults.map(result => {
        const user = userList.find(u => u.id === result.userId);
        if (user) {
            resultList.push(user)
        }
    })

    // マッチしたユーザーを返す
    return NextResponse.json({
        targetUserId: userId,
        users: resultList,
        results: similarityResults,
    });
}