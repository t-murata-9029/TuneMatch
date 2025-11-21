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
import React from 'react';
import getToken from '@/utils/spotify/getToken';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';

type item = {
    artistName: string;
    artistId: string;
    artistImage: string;
    genres: string[];
    followers: string;
};

// ページネーション押下時アーティスト取得関数
async function getArtistNumber(page: number): Promise<item[]> {
    const spotify_access_token = await getToken();
    const dataJson = sessionStorage.getItem("queryData");
    if (!dataJson) return [];

    const data = JSON.parse(dataJson);
    const query = data.query;
    const type = data.type;
    const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=10&offset=${(page - 1) * 10}`;

    const result = await fetch(url, {
        headers: { Authorization: `Bearer ${spotify_access_token}` }
    });

    const json = await result.json();
    let items: item[] = [];

    console.log(json);

    if (json.artists?.items) {
        items = json.artists.items.map((a: any) => ({
            artistId: a.id,
            artistName: a.name,
            artistImage: a.images?.[1]?.url || a.images?.[0]?.url || "",
            genres: a.genres || [],
            followers: a.followers.total,
        }));
    }

    return items;
}

function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    //event.preventDefault();
    console.info('You clicked a breadcrumb.');
}

export default function Page() {
    const router = useRouter();

    const [results, setResults] = React.useState<item[]>([]);
    const [pageCount, setPageCount] = React.useState<number>();

    // 🔹 Spotify API 取得関数
    async function getArtist(): Promise<item[]> {
        const spotify_access_token = await getToken();
        const dataJson = sessionStorage.getItem("queryData");
        if (!dataJson) return [];

        const data = JSON.parse(dataJson);
        const query = data.query;
        const type = data.type;
        const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=10`;

        const result = await fetch(url, {
            headers: { Authorization: `Bearer ${spotify_access_token}` }
        });

        const json = await result.json();
        let items: item[] = [];

        console.log(json);

        if (json.artists?.items) {
            items = json.artists.items.map((a: any) => ({
                artistId: a.id,
                artistName: a.name,
                artistImage: a.images?.[1]?.url || a.images?.[0]?.url || "",
                genres: a.genres || [],
                followers: a.followers.total,
            }));
        }

        console.log(json);
        const responseTotal = json.artists.total;
        console.log(responseTotal);

        let pageCount = Math.ceil(responseTotal / 10);

        setPageCount(pageCount);

        return items;
    }

    const breadcrumbs = [
        <Link underline="hover" key="1" color="inherit" href="artist" onClick={handleClick}>
            Artist
        </Link>
    ];

    // 🔹 useEffect で初回取得
    React.useEffect(() => {
        const fetchArtist = async () => {
            try {
                const items = await getArtist();
                setResults(items);
            } catch (e) {
                console.error('getMusic failed:', e);
            }
        };
        fetchArtist();
    }, []);

    const handleCardClick = (item: item) => {
        sessionStorage.setItem("selectedArtist", JSON.stringify(item));
        console.log(item);
        router.push('../search/album');
    };

    return (
        <NoSsr>
            <Breadcrumbs separator="›" aria-label="breadcrumb">
                {breadcrumbs}
            </Breadcrumbs>
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
                検索結果
                <Box sx={{ height: 16 }} /> {/*空白追加*/}
                <Grid container spacing={2} direction="column" alignItems="center">
                    {results.map((item, index) => (
                        <Grid key={index} sx={{ width: { xs: '90%', sm: '100%', md: '100%' } }}>
                            <Card sx={{
                                display: 'flex', alignItems: 'center', p: 2, cursor: 'pointer', transition: '0.3s',
                                '&:hover': {
                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                                },
                            }}
                                onClick={() => handleCardClick(item)}>
                                <CardMedia
                                    component="img"
                                    sx={{ width: 100, height: 100, borderRadius: 2, mr: 3 }}
                                    image={item.artistImage}
                                    alt={item.artistName}
                                />
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {item.artistName}
                                    </Typography>
                                    <Box sx={{ height: 16 }} /> {/*空白追加*/}
                                    <Typography variant="body2" color="text.secondary">
                                        {'ジャンル：'}
                                        {item.genres.join(', ')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {'フォロワー数：'}
                                        {item.followers.toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{ height: 16 }} /> {/*空白追加*/}
                <Pagination count={pageCount} variant="outlined" shape="rounded" color='primary'
                    onChange={async (event, page) => {
                        const items = await getArtistNumber(page);
                        setResults(items);
                    }}
                />

            </Box>
        </NoSsr>
    );
}
