'use client'

import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Swipe_actions_user } from "../type";
import { getUsersWhoLikedMe } from "../endpoints";
import { UserCard } from "@/components/UserCard";
import { supabase } from "@/lib/supabase.cliant";
import { getCurrentUser } from "@/lib/action";
import { User } from "@/types/db";
import MatchOverlay from "../../recommends/components/MatchOverlay";

/** 
 *  ログインしてるユーザーに対していいねした人表示します。
 * @returns 
 */
export default function LikedList() {

    // 自分に対していいねした人のリスト
    const [likedUserList, setlikedUserList] = useState<Swipe_actions_user[]>();
    const [myUserId, setMyUserId] = useState("");

    const [matchedUser, setMatchedUser] = useState<User | null>(null);
    const [isMatched, setIsMatched] = useState<string | null>(null);


    useEffect(() => {
        const getData = async () => {
            const userList = await getUsersWhoLikedMe()
            setlikedUserList(userList);
            const user = await getCurrentUser();
            if (user?.id) {
                setMyUserId(user.id);
            }
        }
        getData();
    }, [])

    /**
     * ユーザーがいいねした時の処理
     * swipe_actionsを削除して、matchesに追加します
     * @param targetId 
     * @param match_percentage 
     */
    const handleLike = async (targetId: string, match_percentage?: number) => {
        // リストから対象のユーザー情報をあらかじめ確保しておく
        const targetData = likedUserList?.find(r => r.swiper_id === targetId);

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
            setMatchedUser(targetData.swiper!);
            setIsMatched(targetId);
        }
        setlikedUserList(prev => prev?.filter(r => r.swiper_id !== targetId));
        return;
    };

    /**
     * ユーザーがスキップしたときの処理
     * swipe_actionsにSKIPを追加します
     * @param targetId
     */
    const handleDislike = async (targetId: string, match_percentage?: number) => {
        const { error } = await supabase.from("swipe_actions").insert({
            swiper_id: targetId,
            swiped_id: myUserId,
            action_type: "SKIP",
            vibe_match_percentage: match_percentage,
        });
        if (error) throw new Error("SKIP登録エラー");
        setlikedUserList(prev => prev?.filter(r => r.swiper_id !== targetId));
        return;
    };

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

    if (likedUserList) {
        return (
            <Box>
                {likedUserList && likedUserList.length > 0 ? (
                    likedUserList.map((user) => (
                        <UserCard
                            user={user.swiper!}
                            similarityScore={user.vibe_match_percentage}
                            onLike={handleLike}
                            onDislike={handleDislike}
                            key={user.swiper_id}
                        />
                    ))

                ) : (
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh" gap={2}>
                        <Typography variant="h6">いいねは届いていないみたいです...</Typography>
                    </Box>
                )}
            </Box>
        );
    }
}