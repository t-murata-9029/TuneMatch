'use client';

import {
    useMediaQuery,
    Box,
    CssBaseline,
    NoSsr,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Grid,
    Pagination,
    Breadcrumbs,
    Link,
} from '@mui/material';
import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase.cliant';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/action';

type item = {
    matchesId: string;
    partnerId: string;
    partnerName: string;
    partnerImage: string;
    matchRate: number;
};


export default function Page() {
    const router = useRouter();

    const [results, setResults] = React.useState<item[]>([]);
    const [allItems, setAllItems] = React.useState<item[]>([]);
    const [pageCount, setPageCount] = React.useState<number>(1);

    useEffect(() => {
        const fetchMatches = async () => {
            const userData = await getCurrentUser();
            if (!userData) return;

            const user_id = userData.id;

            // ① matches 取得
            const { data: matches, error: matchError } = await supabase
                .from("matches")
                .select("*")
                .or(`user1_id.eq.${user_id},user2_id.eq.${user_id}`);

            if (matchError || !matches) {
                console.error("マッチ相手取得時エラー：", matchError);
                return;
            }

            // ② 最新メッセージ時間付与
            const itemsWithLatestMessage = await Promise.all(
                matches.map(async (match) => {
                    const { data: latestMessage, error } = await supabase
                        .from("chat_messages")
                        .select("sent_at")
                        .eq("match_id", match.id)
                        .order("sent_at", { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (error) {
                        console.error("メッセージ取得エラー:", error);
                    }

                    return {
                        ...match,
                        latestMessageAt: latestMessage?.sent_at ?? null,
                    };
                })
            );

            // ③ partnerUserId を決める
            const itemsWithPartnerId = itemsWithLatestMessage.map((match) => {
                const partnerUserId =
                    match.user1_id === user_id
                        ? match.user2_id
                        : match.user1_id;

                return {
                    ...match,
                    partnerUserId,
                };
            });

            // ④ partnerUserId をまとめて取得
            const partnerIds = itemsWithPartnerId.map(
                (item) => item.partnerUserId
            );

            const { data: partners, error: userError } = await supabase
                .from("users")
                .select("id, username")
                .in("id", partnerIds);

            if (userError || !partners) {
                console.error("ユーザー取得エラー:", userError);
                return;
            }

            // ⑤ Map 化
            const partnerMap = new Map(
                partners.map((u) => [u.id, u])
            );

            // ⑥ item 型に整形（最終形）
            const finalItems = itemsWithPartnerId.map((item) => {
                const partner = partnerMap.get(item.partnerUserId);

                const userImg = "https://tpwncberbdmckktfcnpg.supabase.co/storage/v1/object/public/user_images/" + item.partnerUserId + "/" + item.partnerUserId;

                return {
                    matchesId: item.id,
                    partnerId: item.partnerUserId,
                    partnerName: partner?.username ?? "不明",
                    partnerImage: userImg ?? "/no-image.png",
                    matchRate: item.vibe_match_percentage,
                    latestMessageAt: item.latestMessageAt,
                };
            });

            // ⑦ 最新メッセージ順でソート
            finalItems.sort((a, b) => {
                if (!a.latestMessageAt && !b.latestMessageAt) return 0;
                if (!a.latestMessageAt) return 1;
                if (!b.latestMessageAt) return -1;

                return (
                    new Date(b.latestMessageAt).getTime() -
                    new Date(a.latestMessageAt).getTime()
                );
            });

            // ページング用
            setPageCount(Math.ceil(finalItems.length / 10));
            setAllItems(finalItems);
            setResults(finalItems.slice(0, 10));
        };


        fetchMatches();
    }, []);

    const handleCardClick = (item: item) => {
        sessionStorage.setItem("MessageRecipient", JSON.stringify(item));
        router.push('../matches/message');
    };

    return (
        <NoSsr>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    p: 2,
                }}
            >
                マッチ者リスト
                <Box sx={{ height: 16 }} />
                <Grid container spacing={2} direction="column" alignItems="center">
                    {results.map((item, index) => (
                        <Grid key={index} sx={{ width: { xs: '90%', sm: '100%', md: '100%' } }}>
                            <Card
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: 2,
                                    cursor: 'pointer',
                                    transition: '0.3s',
                                    '&:hover': {
                                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                                    },
                                }}
                                onClick={() => handleCardClick(item)}
                            >
                                <CardMedia
                                    component="img"
                                    sx={{ width: 100, height: 100, borderRadius: 2, mr: 3 }}
                                    image={item.partnerImage}
                                    alt={item.partnerName}
                                />
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {item.partnerName}
                                    </Typography>
                                    <Box sx={{ height: 16 }} /> {/*空白追加*/}
                                    <Typography variant="body2" fontWeight="text.secondary">
                                        マッチ度：{item.matchRate}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{ height: 16 }} /> {/*空白追加*/}
                <Pagination count={pageCount} variant="outlined" shape="rounded" color='primary'
                    onChange={async (event, page) => {
                        setResults(allItems.slice((page - 1) * 10, (page * 10) - 1));
                    }}
                />
            </Box>
        </NoSsr>
    );
}

function async() {
    throw new Error('Function not implemented.');
}
