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
import getToken from '@/utils/spotify/getToken';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';
import { getCurrentUser } from '@/lib/action';
import { matchesGlob } from 'path';
import { read } from 'fs';
import { json } from 'stream/consumers';

type item = {
    partnerId: string;
    partnerName: string;
    partnerImage: string;
    matchRate: number;
};

export default function Page() {
    const router = useRouter();

    const [results, setResults] = React.useState<item[]>([]);
    const [pageCount, setPageCount] = React.useState<number>(1);

    useEffect(() => {
        const fetchMatches = async () => {
            const userData = await getCurrentUser();
            if (!userData) return;

            const user_id = userData.id;

            const { data: matches, error: matchError } = await supabase
                .from('matches')
                .select('*')
                .or(`user1_id.eq.${user_id},user2_id.eq.${user_id}`);

            if (matchError || !matches) {
                console.error('マッチ相手取得時エラー：', matchError);
                return;
            }

            // マッチ相手IDの配列
            const partnerIds = matches.map(match =>
                match.user1_id === user_id ? match.user2_id : match.user1_id
            );

            if (partnerIds.length === 0) return;

            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id, username')
                .in('id', partnerIds);

            if (userError || !users) {
                console.error('ユーザー情報取得時エラー：', userError);
                return;
            }

            // 結果整形
            const resultsData = users.map(user => {
                const matchData = matches.find(m =>
                    m.user1_id === user.id || m.user2_id === user.id
                );

                const userImg = "https://tpwncberbdmckktfcnpg.supabase.co/storage/v1/object/public/user_images/" + user.id + "/" + user.id

                return {
                    partnerId: user.id,
                    partnerName: user.username,
                    partnerImage: userImg,
                    matchRate: matchData?.vibe_match_percentage ?? 0,
                };
            });

            setResults(resultsData);
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
                


            </Box>
        </NoSsr>
    );
}