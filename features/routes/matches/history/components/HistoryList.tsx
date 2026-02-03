'use client';

import { useEffect, useState } from "react";
import { Swipe_actions_user } from "../../liked/type";
import { UserCard } from "@/components/UserCard";
import { getSwipeActionsHistory } from "../endpoints";
import { Box, Typography } from "@mui/material";
import { getCurrentUser } from "@/lib/action";
import { supabase } from "@/lib/supabase.cliant";

/**
 * 過去にスワイプしたユーザーのリストを表示するコンポーネント
 * @returns 過去にスワイプしたユーザーコンポーネント
 */
export default function HistoryList() {
    // 自分に対していいねした人のリスト
    const [historyList, setHistoryList] = useState<Swipe_actions_user[]>([]);
    const [myUserId, setMyUserId] = useState("");

    useEffect(() => {
        const getData = async () => {
            const list = await getSwipeActionsHistory();
            setHistoryList(list);
            const user = await getCurrentUser();
            if (user?.id) {
                setMyUserId(user.id);
            }

        }
        getData();
    }, [])

    /**
     * ユーザーがいいねした時の処理
     * swipe_actionsを更新します
     * @param targetId 
     * @param match_percentage
     */
    const handleLike = async (targetId: string, match_percentage?: number) => {
        const { error } = await supabase.from("swipe_actions")
            .update({ action_type: "LIKE", vibe_match_percentage: match_percentage })
            .eq("swiper_id", myUserId)
            .eq("swiped_id", targetId);
        if (error) {
            console.error(error);
            throw new Error("Swipe action 更新エラー");
        }
        setHistoryList((prev) =>
            prev.map((item) =>
                item.swiped_id === targetId
                    ? { ...item, action_type: "LIKE" }
                    : item
            ))
    };

    /**
     * ユーザーがスキップした時の処理
     * swipe_actionsを更新します
     * @param targetId 
     * @param match_percentage 
     */
    const handleDislike = async (targetId: string, match_percentage?: number) => {
        const { error } = await supabase.from("swipe_actions")
            .update({ action_type: "SKIP", vibe_match_percentage: match_percentage })
            .eq("swiper_id", myUserId)
            .eq("swiped_id", targetId);
        if (error) {
            console.error(error);
            throw new Error("Swipe action 更新エラー");
        }
        setHistoryList((prev) =>
            prev.map((item) =>
                item.swiped_id === targetId
                    ? { ...item, action_type: "SKIP" }
                    : item
            ))
    };

    if (historyList) {
        return (
            <Box>
                {historyList && historyList.length > 0 ? (
                    historyList.map((user) => (
                        <UserCard
                            user={user.swiped!}
                            similarityScore={user.vibe_match_percentage}
                            onLike={handleLike}
                            onDislike={handleDislike}
                            key={user.id}
                            currentAction={user.action_type}
                        />
                    ))

                ) : (
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh" gap={2}>
                        <Typography variant="h6">スワイプ履歴はありません...</Typography>
                    </Box>
                )}
            </Box>
        );
    }
}