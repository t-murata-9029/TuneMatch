'use client'

import { useEffect, useState } from "react"
import { getRecommendsList } from "../endpoints"
import { Box, Typography } from "@mui/material";
import { Recommends } from "../types";
import { supabase } from "@/lib/supabase.cliant";
import { getCurrentUser } from "@/lib/action";
import MatchOverlay from "./MatchOverlay";
import { UserCard } from "@/components/UserCard";
import { User } from "@/types/db"; // User型をインポート

export default function RecommendsList() {
    const [recommendsList, setRecommendsList] = useState<Recommends[]>([]);
    const [myUserId, setMyUserId] = useState("");

    // マッチした相手のユーザー情報を保持するステートを追加
    const [matchedUser, setMatchedUser] = useState<User | null>(null);
    const [isMatched, setIsMatched] = useState<string | null>(null);

    useEffect(() => {
        const setData = async () => {
            const list = await getRecommendsList();
            setRecommendsList(list || []);

            const user = await getCurrentUser();
            if (user?.id) {
                setMyUserId(user.id);
            }
        }
        setData();
    }, [])

    /*--- ユーザーがLike押したときの処理 ---*/
    const handleLike = async (targetId: string, match_percentage?: number) => {
        // リストから対象のユーザー情報をあらかじめ確保しておく
        const targetData = recommendsList.find(r => r.user.id === targetId);
        
        try {
            // 相手がLIKEしてるか確認
            const { count, error: getError } = await supabase
                .from("swipe_actions")
                .select('*', { count: 'exact', head: true })
                .eq("swiper_id", targetId)
                .eq("swiped_id", myUserId)
                .eq("action_type", "LIKE");

            if (getError) throw new Error("DB取得エラー");

            // マッチした場合
            if (count != null && count > 0) {
                const [user1_id, user2_id] = myUserId < targetId 
                    ? [myUserId, targetId] 
                    : [targetId, myUserId];

                const { error: matchError } = await supabase.from("matches").insert({
                    user1_id,
                    user2_id,
                    vibe_match_percentage: match_percentage,
                });

                if (matchError) throw new Error("Match登録エラー");

                await supabase.from("swipe_actions").delete()
                    .eq("swiper_id", targetId)
                    .eq("swiped_id", myUserId);

                // リストから消える前に、確保しておいたユーザー情報をセット
                if (targetData) {
                    setMatchedUser(targetData.user);
                    setIsMatched(targetId);
                }
                return;
            }

            // 通常のLIKE登録
            const { error: insertError } = await supabase.from("swipe_actions").insert({
                swiper_id: myUserId,
                swiped_id: targetId,
                action_type: "LIKE",
                vibe_match_percentage: match_percentage,
            });

            if (insertError) throw new Error("LIKE登録エラー");

        } catch (error) {
            console.error(error);
        } finally {
            // 最後にリストから除外
            setRecommendsList(prev => prev.filter(r => r.user.id !== targetId));
        }
    };

    /*--- ユーザーがDislike押したときの処理 ---*/
    const handleDislike = async (targetId: string, match_percentage?: number) => {
        await supabase.from("swipe_actions").insert({
            swiper_id: myUserId,
            swiped_id: targetId,
            action_type: "SKIP",
            vibe_match_percentage: match_percentage,
        });

        setRecommendsList(prev => prev.filter(r => r.user.id !== targetId));
    }

    // マッチング時の表示
    if (isMatched && matchedUser) {
        return (
            <MatchOverlay 
                targetUser={matchedUser} 
                setIsMatched={(val) => {
                    setIsMatched(val);
                    setMatchedUser(null); // 閉じるときに情報をクリア
                }} 
            />
        );
    }

    // リストが空の場合
    if (recommendsList.length == 0) {
        return (
            <>
                <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh" gap={2}>
                    <Typography variant="h6">おすすめの人はいないみたいです...</Typography>
                </Box>
            </>
        );
    }

    return (
        <Box>
            {recommendsList.map((recommend) => (
                <UserCard
                    key={recommend.user.id}
                    user={recommend.user}
                    similarityScore={recommend.similarityScore}
                    matchReasons={recommend.matchReasons}
                    onLike={handleLike}
                    onDislike={handleDislike}
                />
            ))}
        </Box>
    );
}