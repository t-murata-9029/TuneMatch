'use client'

import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Swipe_actions_user } from "../type";
import { getUsersWhoLikedMe } from "../endpoints";
import { UserCard } from "@/components/UserCard";

/** 
 *  ログインしてるユーザーに対していいねした人表示します。
 * @returns 
 */
export default function LikedList() {

    // 自分に対していいねした人のリスト
    const [likedUserList, setlikedUserList] = useState<Swipe_actions_user[]>();

    useEffect(() => {
        const getData = async () => {
            const userList = await getUsersWhoLikedMe()
            setlikedUserList(userList);
        }
        getData();
    }, [])

    const handleLike = () => {};
    const handleDislike = () => {};

    return (
        <Box>
            {likedUserList && likedUserList.length > 0 ? (
                likedUserList.map((user) => (
                    <UserCard 
                        user={user.swiper!} 
                        similarityScore={user.vibe_match_percentage}
                        onLike={handleLike}
                        onDislike={handleDislike}
                    />
                ))

            ) : (
                <Typography variant="body1">いいねしたユーザーがいません</Typography>
            )}
        </Box>
    );
}