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
} from '@mui/material';
import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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

export default function Page() {
    const router = useRouter();

    const [results, setResults] = React.useState<item[]>([]);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    // 🔹 テーマ
    const theme = React.useMemo(
        () =>
            createTheme({
                palette: { mode: prefersDarkMode ? 'dark' : 'light' },
                components: {
                    MuiOutlinedInput: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: prefersDarkMode ? '#ffffff' : '#000000',
                                    borderWidth: 2,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: prefersDarkMode ? '#64b5f6' : '#42a5f5',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: prefersDarkMode ? '#2196f3' : '#1565c0',
                                },
                            },
                        },
                    },
                },
            }),
        [prefersDarkMode]
    );

    // 🔹 Spotify API 取得関数
    async function getArtist(): Promise<item[]> {
        const spotify_access_token = await getToken();
        const dataJson = sessionStorage.getItem("queryData");
        if (!dataJson) return [];

        const data = JSON.parse(dataJson);
        const query = data.query;
        const type = data.type;
        const limit = data.limit;
        const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=${limit}`;

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
            <ThemeProvider theme={theme}>
                <CssBaseline />
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
                                <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}
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
                </Box>
            </ThemeProvider>
        </NoSsr>
    );
}
