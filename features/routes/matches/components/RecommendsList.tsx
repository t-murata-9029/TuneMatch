'use client'

import { useEffect, useState } from "react"
import { getRecommendsList } from "../endpoints"
import { Avatar, Box, Card, CardContent, Typography } from "@mui/material";
import { Recommends } from "../types";

/**
 * おすすめの人を表示するよ
 */
export default function RecommendsList() {
    const [recommendsList, setRecommendsList] = useState<Recommends[]>();

    useEffect(() => {
        const setData = async () => {
            const list = await getRecommendsList();
            setRecommendsList(list)
        }

        setData();
        console.log(recommendsList)
    }, [])

    return (
        <>
            <Box display="flex" flexDirection="column" gap={2}>
                {recommendsList?.map((recommend) => (
                    <Card key={recommend.user.id} sx={{ minWidth: 275 }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                {/* 左：ユーザーアイコン */}
                                <Avatar
                                    src={"https://tpwncberbdmckktfcnpg.supabase.co/storage/v1/object/public/user_images/" + recommend.user.id + "/" + recommend.user.id}
                                    alt={recommend.user.username}
                                    sx={{ width: 56, height: 56 }}
                                />

                                {/* 右：情報 */}
                                <Box>
                                    <Typography variant="h6">
                                        {recommend.user.username}
                                    </Typography>

                                    <Typography color="text.secondary">
                                        類似度: {recommend.similarityScore}
                                    </Typography>
                                    <Typography variant="body2">
                                        一致した項目：{recommend.matchReasons.mostSimilarKeys[0]}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {recommend.user.profile_text}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </>
    );
}