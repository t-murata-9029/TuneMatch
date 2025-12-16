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
import { match } from 'assert';

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

            console.log("matches" , matches);

            if (matchError || !matches) {
                console.error('マッチ相手取得時エラー：', matchError);
                return;
            }

            const pageCount = matches.length;

            setPageCount(Math.ceil(pageCount / 10));

            // 1ページ目のマッチリスト取得

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
//                    onChange={async (event, page) => {
//                        const items = ;
//                        setResults(items);                      
//                    }}
                />
            </Box>
        </NoSsr>
    );
}

function async() {
    throw new Error('Function not implemented.');
}
